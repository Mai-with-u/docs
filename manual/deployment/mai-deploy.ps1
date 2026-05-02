# MaiBot 可视化交互部署脚本
# 适合小白：一问一答式引导，无需记忆任何命令

param(
    [string]$InstallPath = "",
    [switch]$SkipPrereq,
    [switch]$SkipClone,
    [switch]$AutoConfig
)

# ============ 样式配置 ============
function Write-Banner {
    param([string]$Text)
    $colors = @("Cyan", "Yellow", "Green", "Magenta")
    $i = 0
    $Text -split "`n" | ForEach-Object {
        Write-Host $("  $_") -ForegroundColor $colors[$i % $colors.Length]
        $i++
    }
}

function Write-Step {
    param([int]$Num, [string]$Title, [string]$Desc = "")
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║  步骤 $Num : $Title" -ForegroundColor Cyan
    Write-Host "  ╚══════════════════════════════════════════════════╝" -ForegroundColor Cyan
    if ($Desc) { Write-Host "  $Desc" -ForegroundColor DarkGray }
}

function Write-Success {
    param([string]$Msg)
    Write-Host "  ✅ $Msg" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Msg)
    Write-Host "  ⚠️  $Msg" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Msg)
    Write-Host "  ❌ $Msg" -ForegroundColor Red
}

function Press-Key {
    Write-Host ""
    Write-Host "  按任意键继续..." -ForegroundColor DarkGray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# ============ 环境检测 ============
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-DockerStatus {
    $dockerOk = $false
    $composeOk = $false

    try {
        $null = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) { $dockerOk = $true }
    } catch { }

    try {
        $null = docker compose version 2>$null
        if ($LASTEXITCODE -eq 0) { $composeOk = $true }
    } catch { }

    return @($dockerOk, $composeOk)
}

# ============ 主流程 ============

Clear-Host
Write-Host ""
Write-Host "  ██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗" -ForegroundColor Cyan
Write-Host "  ██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██║" -ForegroundColor Cyan
Write-Host "  ██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║" -ForegroundColor Cyan
Write-Host "  ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║" -ForegroundColor Cyan
Write-Host "  ██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝" -ForegroundColor Cyan
Write-Host "  ╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "  ║          🐳 MaiBot 可视化交互部署脚本 v1.0 (小白友好版)         ║" -ForegroundColor Yellow
Write-Host "  ║          自动检测环境 · 中文引导 · 一路回车即可部署完成          ║" -ForegroundColor Yellow
Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""

# ---- 前置检查 ----
if (-not $SkipPrereq) {
    Write-Step 0 "环境检测"
    Write-Host "  检查 Docker 和 Docker Compose 是否已安装..."

    $dockerOk = $false
    $composeOk = $false

    try {
        $dockerVer = docker --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker 已安装: $dockerVer"
            $dockerOk = $true
        }
    } catch {
        Write-Error "Docker 未安装或未启动"
    }

    try {
        $composeVer = docker compose version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Compose 已安装: $composeVer"
            $composeOk = $true
        }
    } catch {
        Write-Error "Docker Compose 未安装"
    }

    if (-not ($dockerOk -and $composeOk)) {
        Write-Host ""
        Write-Warn "请先安装 Docker Desktop：https://docs.docker.com/desktop/install/windows-install/"
        Write-Host ""
        Write-Host "  安装步骤："
        Write-Host "  1. 下载 Docker Desktop for Windows"
        Write-Host "  2. 运行安装程序（注意勾选 WSL2 后端）"
        Write-Host "  3. 重启电脑"
        Write-Host "  4. 再次运行本脚本"
        Press-Key
        exit 1
    }
}

# ---- 安装路径选择 ----
Write-Step 1 "选择安装位置"
if (-not $InstallPath) {
    $defaultPath = "$HOME\MaiBot"
    Write-Host "  请输入安装目录路径（直接回车使用默认路径）：" -ForegroundColor White
    Write-Host "  默认路径: $defaultPath" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host -NoNewline "  路径: " -ForegroundColor White
    $InstallPath = Read-Host
    if ([string]::IsNullOrWhiteSpace($InstallPath)) {
        $InstallPath = $defaultPath
    }
}

# 解析绝对路径
$InstallPath = $ExecutionContext.InvokeCommand.ExpandString($InstallPath)
if (-not [System.IO.Path]::IsPathRooted($InstallPath)) {
    $InstallPath = Join-Path $PWD $InstallPath
}

Write-Host "  安装路径: $InstallPath" -ForegroundColor White

# ---- 克隆代码 ----
Write-Step 2 "克隆 MaiBot 源码"

if (-not $SkipClone) {
    if (Test-Path $InstallPath) {
        Write-Warn "目录已存在: $InstallPath"
        Write-Host "  1) 重新克隆（清空目录）"
        Write-Host "  2) 使用现有目录"
        Write-Host ""
        Write-Host -NoNewline "  选择 [1/2]: " -ForegroundColor White
        $choice = Read-Host
        if ($choice -eq "1") {
            Write-Host "  正在删除旧目录..." -ForegroundColor Yellow
            Remove-Item -Recurse -Force $InstallPath
        }
    }

    if (-not (Test-Path $InstallPath)) {
        Write-Host "  正在克隆 MaiBot 源码..." -ForegroundColor White
        Write-Host "  仓库: https://github.com/MaiM-with-u/MaiBot.git" -ForegroundColor DarkGray
        Write-Host ""

        git clone https://github.com/MaiM-with-u/MaiBot.git $InstallPath 2>&1 | ForEach-Object {
            Write-Host "    $_" -ForegroundColor DarkGray
        }

        if ($LASTEXITCODE -ne 0) {
            Write-Error "克隆失败，请检查网络连接"
            exit 1
        }
        Write-Success "克隆完成"
    } else {
        Write-Success "使用已有目录"
    }
}

# ---- 首次启动 ----
Write-Step 3 "首次启动（生成配置文件）"
Write-Host "  现在启动 Docker 容器（首次启动会自动生成配置文件）..." -ForegroundColor White
Write-Host "  这可能需要几分钟，请耐心等待..." -ForegroundColor DarkGray
Write-Host ""

Set-Location $InstallPath
docker compose up -d 2>&1 | ForEach-Object {
    Write-Host "    $_" -ForegroundColor DarkGray
}

if ($LASTEXITCODE -ne 0) {
    Write-Error "启动失败，请运行以下命令查看日志："
    Write-Host "    docker compose logs core" -ForegroundColor Yellow
    exit 1
}

Write-Success "容器启动成功！"

# 等待配置文件生成
Write-Host ""
Write-Host "  等待配置文件生成..." -ForegroundColor White
Start-Sleep -Seconds 5

# ---- 配置引导 ----
Write-Step 4 "配置引导（重要！）"

$configDir = Join-Path $InstallPath "docker-config\mmc"
$botConfigPath = Join-Path $configDir "bot_config.toml"
$modelConfigPath = Join-Path $configDir "model_config.toml"

Write-Host ""
Write-Host "  请按以下步骤配置（也可以直接编辑配置文件）：" -ForegroundColor Yellow
Write-Host ""

# 读取 bot_config.toml
Write-Host "  === bot_config.toml（机器人基础配置）===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $botConfigPath) {
    $botConfigContent = Get-Content $botConfigPath -Raw -Encoding UTF8
    Write-Host $botConfigContent -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "  请输入 QQ 号（登录机器人的 QQ 号）：" -ForegroundColor White
Write-Host -NoNewline "  QQ号: " -ForegroundColor White
$qqNum = Read-Host

Write-Host "  请输入 QQ 密码（登录密码）：" -ForegroundColor White
Write-Host -NoNewline "  密码: " -ForegroundColor White
$qqPwd = Read-Host -MaskInput

Write-Host ""

# 读取 model_config.toml
Write-Host "  === model_config.toml（AI 模型配置）===" -ForegroundColor Cyan
Write-Host ""

if (Test-Path $modelConfigPath) {
    $modelConfigContent = Get-Content $modelConfigPath -Raw -Encoding UTF8
    Write-Host $modelConfigContent -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host "  请选择 AI 提供商：" -ForegroundColor White
Write-Host "  1) OpenAI (ChatGPT)"
Write-Host "  2) 硅基流动 (SiliconFlow)"
Write-Host "  3) 阿里云百炼"
Write-Host "  4) 其他 / 手动填写"
Write-Host ""
Write-Host -NoNewline "  选择 [1-4]: " -ForegroundColor White
$providerChoice = Read-Host

$apiKey = ""
$baseUrl = ""

switch ($providerChoice) {
    "1" {
        Write-Host -NoNewline "  请输入 OpenAI API Key: " -ForegroundColor White
        $apiKey = Read-Host
        $baseUrl = "https://api.openai.com/v1"
        $modelName = "gpt-4o-mini"
    }
    "2" {
        Write-Host -NoNewline "  请输入 SiliconFlow API Key: " -ForegroundColor White
        $apiKey = Read-Host
        $baseUrl = "https://api.siliconflow.cn/v1"
        Write-Host -NoNewline "  请输入模型名称 [默认: Qwen/Qwen2.5-7B-Instruct]: " -ForegroundColor White
        $modelName = Read-Host
        if ([string]::IsNullOrWhiteSpace($modelName)) { $modelName = "Qwen/Qwen2.5-7B-Instruct" }
    }
    "3" {
        Write-Host -NoNewline "  请输入阿里云百炼 API Key: " -ForegroundColor White
        $apiKey = Read-Host
        $baseUrl = "https://dashscope.aliyuncs.com/compatible-mode/v1"
        Write-Host -NoNewline "  请输入模型名称 [默认: qwen-plus]: " -ForegroundColor White
        $modelName = Read-Host
        if ([string]::IsNullOrWhiteSpace($modelName)) { $modelName = "qwen-plus" }
    }
    default {
        Write-Host -NoNewline "  请输入 API Key: " -ForegroundColor White
        $apiKey = Read-Host
        Write-Host -NoNewline "  请输入 API Base URL: " -ForegroundColor White
        $baseUrl = Read-Host
        Write-Host -NoNewline "  请输入模型名称: " -ForegroundColor White
        $modelName = Read-Host
    }
}

# 写入配置
Write-Host ""
Write-Host "  正在写入配置文件..." -ForegroundColor White

# bot_config.toml
if (Test-Path $botConfigPath) {
    $botContent = Get-Content $botConfigPath -Raw -Encoding UTF8
} else {
    $botContent = @"
qq = $qqNum
password = `"$qqPwd`"
"@
}
Set-Content -Path $botConfigPath -Value $botContent -Encoding UTF8

# model_config.toml
$modelContent = @"
api_key = `"$apiKey`"
base_url = `"$baseUrl`"
model = `"$modelName`"
"@
Set-Content -Path $modelConfigPath -Value $modelContent -Encoding UTF8

Write-Success "配置已保存"

# ---- 重启服务 ----
Write-Step 5 "重启核心服务"
Write-Host "  正在重启 core 容器以应用配置..." -ForegroundColor White
Write-Host ""

docker compose restart core 2>&1 | ForEach-Object {
    Write-Host "    $_" -ForegroundColor DarkGray
}

Write-Success "重启完成！"
Write-Host ""
Write-Host "  正在监控 core 日志（5秒后自动停止，按 Ctrl+C 可提前退出）..." -ForegroundColor DarkGray
Start-Sleep -Seconds 5

docker compose logs --tail=30 core 2>&1 | ForEach-Object {
    Write-Host "    $_" -ForegroundColor DarkGray
}

# ---- 完成提示 ----
Write-Step 6 "部署完成！🎉"
Write-Host ""
Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║                    访问地址汇总                              ║" -ForegroundColor Green
Write-Host "  ╠════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "  ║  🌐 Web 界面:     http://localhost:18001                   ║" -ForegroundColor Green
Write-Host "  ║  📊 数据库工具:   http://localhost:8120                    ║" -ForegroundColor Green
Write-Host "  ║  🔧 NapCat QQ:   localhost:6099                           ║" -ForegroundColor Green
Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  常用命令：" -ForegroundColor White
Write-Host "  · 查看日志:  docker compose logs -f core" -ForegroundColor DarkGray
Write-Host "  · 停止服务:  docker compose down" -ForegroundColor DarkGray
Write-Host "  · 重启服务:  docker compose restart" -ForegroundColor DarkGray
Write-Host "  · 配置文件:  $configDir" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  祝您使用愉快！有问题请查看文档或提交 Issue。" -ForegroundColor Yellow
Write-Host ""
