import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录，模拟 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

interface PackageInfo {
    name: string;
    currentVersion: string;
    latestVersion: string | null;
    error?: string;
}

async function checkLatestVersion(packageName: string): Promise<string | null> {
    try {
        const response = await fetch(`https://unpkg.com/${packageName}/package.json`);
        if (!response.ok) {
            console.log(`⚠️  包 "${packageName}" 未找到或请求失败 (状态码: ${response.status})`);
            return null;
        }
        const data = await response.json() as { version?: string };
        return data.version || null;
    } catch (error) {
        console.error(`❌ 检查包 "${packageName}" 时出错:`, error instanceof Error ? error.message : String(error));
        return null;
    }
}

async function checkAllDependencies(): Promise<void> {
    try {
        // 读取并解析 package.json
        const packageJsonPath = path.join(__dirname, 'package.json');
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
        
        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        const packageNames = Object.keys(allDeps);

        if (packageNames.length === 0) {
            console.log('📭 没有找到任何依赖包');
            return;
        }

        console.log(`🔍 正在检查 ${packageNames.length} 个依赖包的最新版本...\n`);

        const results: PackageInfo[] = [];

        for (const name of packageNames) {
            const latestVersion = await checkLatestVersion(name);
            const currentVersion = allDeps[name] || '未知';
            
            results.push({
                name,
                currentVersion,
                latestVersion
            });

            // 立即输出结果
            if (latestVersion) {
                const isUpToDate = currentVersion.replace(/^[\^~]/, '') === latestVersion;
                const status = isUpToDate ? '✅ 已是最新' : '🔄 可更新';
                console.log(`📦 ${name}: 当前版本 ${currentVersion} → 最新版本 ${latestVersion} ${status}`);
            } else {
                console.log(`📦 ${name}: 当前版本 ${currentVersion} → ❌ 无法获取最新版本`);
            }
            
            // 加入短暂延迟，避免请求过快
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 输出汇总统计
        console.log('\n' + '='.repeat(50));
        const total = results.length;
        const success = results.filter(r => r.latestVersion !== null).length;
        const outdated = results.filter(r => {
            if (!r.latestVersion) return false;
            return r.currentVersion.replace(/^[\^~]/, '') !== r.latestVersion;
        }).length;
        
        console.log(`📊 统计: 总共 ${total} 个包, 成功检查 ${success} 个, 其中 ${outdated} 个可更新`);

    } catch (error) {
        console.error('❌ 读取 package.json 失败:', error instanceof Error ? error.message : String(error));
    }
}

// 执行主函数
checkAllDependencies();