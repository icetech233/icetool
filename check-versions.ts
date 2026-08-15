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
        const url = `https://unpkg.com/${packageName}`;
        const response = await fetch(url, {
            redirect: 'manual',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
            }
        });

        if (response.status === 302 || response.status === 301) {
            const location = response.headers.get('location');
            if (location) {
                const atIndex = location.lastIndexOf('@');
                if (atIndex !== -1) {
                    // split('/')[0] 兜底，无论尾部有没有 / 或 /index.js 都能正确提取
                    return location.slice(atIndex + 1).split('/')[0];
                }
            }
            console.log(`⚠️  包 "${packageName}" 重定向但无法解析版本号: ${location}`);
            return null;
        }
        console.log(`⚠️  包 "${packageName}" 未找到或请求失败 (状态码: ${response.status})`);
        return null;
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

            // 加入短暂延迟，避免请求过快被限流
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