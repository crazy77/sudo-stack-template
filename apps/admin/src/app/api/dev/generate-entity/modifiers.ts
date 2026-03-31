import fs from "node:fs/promises";
import path from "node:path";
import type { EntityDefinition } from "./schema";

let cachedRoot: string | null = null;

export async function getMonorepoRoot(): Promise<string> {
  if (cachedRoot) return cachedRoot;
  let dir = process.cwd();
  while (dir !== "/") {
    try {
      await fs.access(path.join(dir, "turbo.json"));
      cachedRoot = dir;
      return dir;
    } catch {
      dir = path.dirname(dir);
    }
  }
  throw new Error("모노레포 루트(turbo.json)를 찾을 수 없습니다");
}

/** import 줄 삽입 + 객체 리터럴에 항목 삽입하는 공통 헬퍼 */
function insertImportAndEntry(
  content: string,
  importLine: string,
  objectPattern: RegExp,
  entry: string,
  errorContext: string,
): string {
  // import 삽입
  const lastImportIndex = content.lastIndexOf("import ");
  const lastImportEnd = content.indexOf("\n", lastImportIndex);
  let result =
    content.slice(0, lastImportEnd + 1) +
    importLine +
    "\n" +
    content.slice(lastImportEnd + 1);

  // 객체에 항목 삽입
  const objMatch = result.match(objectPattern);
  if (!objMatch) {
    throw new Error(`${errorContext}에서 객체 패턴을 찾을 수 없습니다`);
  }

  const objContent = objMatch[1];
  const lastComma = objContent.lastIndexOf(",");
  if (lastComma === -1) {
    throw new Error(`${errorContext}에서 항목을 찾을 수 없습니다`);
  }

  const objStart = result.indexOf(objMatch[0]) + objMatch[0].indexOf("{") + 1;
  const insertPos = objStart + lastComma + 1;
  result = result.slice(0, insertPos) + "\n" + entry + result.slice(insertPos);

  return result;
}

export async function modifySchemaIndex(tableName: string): Promise<string> {
  const root = await getMonorepoRoot();
  const filePath = path.join(root, "packages/db/src/schema/index.ts");
  const content = await fs.readFile(filePath, "utf-8");

  const newLine = `export * from "./${tableName}";`;
  if (content.includes(newLine)) {
    throw new Error(
      `schema/index.ts에 이미 "${tableName}" export가 존재합니다`,
    );
  }

  const lines = content.trim().split("\n");
  lines.push(newLine);
  lines.sort();

  const result = `${lines.join("\n")}\n`;
  await fs.writeFile(filePath, result, "utf-8");
  return filePath;
}

export async function modifyAppRouter(routerKey: string): Promise<string> {
  const root = await getMonorepoRoot();
  const filePath = path.join(root, "packages/api/src/router.ts");
  let content = await fs.readFile(filePath, "utf-8");

  const routerName = `${routerKey}Router`;
  if (content.includes(routerName)) {
    throw new Error(`router.ts에 이미 "${routerName}"이 존재합니다`);
  }

  content = insertImportAndEntry(
    content,
    `import { ${routerName} } from "./routers/${routerKey}";`,
    /os\.router\(\{([\s\S]*?)\}\)/,
    `  ${routerKey}: ${routerName},`,
    "router.ts",
  );

  await fs.writeFile(filePath, content, "utf-8");
  return filePath;
}

export async function modifyEntityRegistry(routerKey: string): Promise<string> {
  const root = await getMonorepoRoot();
  const filePath = path.join(root, "apps/admin/src/entities/registry.ts");
  let content = await fs.readFile(filePath, "utf-8");

  const configName = `${routerKey}Config`;
  if (content.includes(configName)) {
    throw new Error(`registry.ts에 이미 "${configName}"이 존재합니다`);
  }

  content = insertImportAndEntry(
    content,
    `import { ${configName} } from "./${routerKey}/config";`,
    /entityConfigs[^{]*\{([\s\S]*?)\};/,
    `  ${routerKey}: ${configName},`,
    "registry.ts",
  );

  await fs.writeFile(filePath, content, "utf-8");
  return filePath;
}

export async function modifyNavigation(def: EntityDefinition): Promise<string> {
  const root = await getMonorepoRoot();
  const filePath = path.join(root, "apps/admin/src/config/navigation.ts");
  let content = await fs.readFile(filePath, "utf-8");

  // 아이콘 import 추가
  const iconImportMatch = content.match(
    /import\s*\{([^}]+)\}\s*from\s*"lucide-react"/,
  );
  if (!iconImportMatch) {
    throw new Error("navigation.ts에서 lucide-react import를 찾을 수 없습니다");
  }

  const existingIcons = iconImportMatch[1]
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (!existingIcons.includes(def.iconName)) {
    existingIcons.push(def.iconName);
    const typeImports = existingIcons.filter((s) => s.startsWith("type "));
    const valueImports = existingIcons.filter((s) => !s.startsWith("type "));
    valueImports.sort();
    typeImports.sort();
    const allImports = [...valueImports, ...typeImports];

    const newImportBlock = `import {\n  ${allImports.join(",\n  ")},\n} from "lucide-react"`;
    content = content.replace(
      /import\s*\{[^}]+\}\s*from\s*"lucide-react"/,
      newImportBlock,
    );
  }

  // 네비게이션 그룹에 항목 추가
  const navItem = `      { id: "${def.routerKey}", label: "${def.labelSingular}", href: "/${def.slug}", icon: ${def.iconName} }`;
  const groupPattern = new RegExp(
    `id:\\s*"${def.navGroupId}"[\\s\\S]*?items:\\s*\\[([\\s\\S]*?)\\]`,
  );
  const groupMatch = content.match(groupPattern);
  if (!groupMatch) {
    throw new Error(
      `navigation.ts에서 그룹 "${def.navGroupId}"를 찾을 수 없습니다`,
    );
  }

  const itemsContent = groupMatch[1];
  const groupStart = content.indexOf(groupMatch[0]);
  const itemsStart = groupStart + groupMatch[0].indexOf("[") + 1;
  const itemsEnd = itemsStart + itemsContent.length;

  const trimmedItems = itemsContent.trimEnd();
  const needsComma = trimmedItems.length > 0 && !trimmedItems.endsWith(",");

  content =
    content.slice(0, itemsEnd) +
    (needsComma ? "," : "") +
    "\n" +
    navItem +
    ",\n    " +
    content.slice(itemsEnd);

  await fs.writeFile(filePath, content, "utf-8");
  return filePath;
}
