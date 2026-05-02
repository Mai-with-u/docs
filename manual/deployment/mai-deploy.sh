#!/bin/bash
# ============================================================
#   MaiBot 可视化交互部署脚本 (Linux/macOS 版)
#   适合小白：一问一答式引导，无需记忆任何命令
# ============================================================

set -e

# ============ 颜色定义 ============
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# ============ 样式函数 ============
banner() {
    local text="$1"
    local colors=("$CYAN" "$YELLOW" "$GREEN" "$MAGENTA")
    local i=0
    while IFS= read -r line; do
        echo -e "  ${colors[$i % 4]}$line${NC}"
        ((i++))
    done <<< "$text"
}

step() {
    echo ""
    echo -e "${CYAN}  ╔══════════════════════════════════════════════════════════╗${NC}"
    printf "  ║  步骤 %d : %s" "$1" "$2"
    # 动态填充空格
    local len=${#2}
    local spaces=$((46 - len))
    for ((i=0; i<spaces; i++)); do printf " "; done
    echo "║"
    echo -e "${CYAN}  ╚══════════════════════════════════════════════════════════╝${NC}"
    if [[ -n "$3" ]]; then echo -e "  $3"; fi
}

ok()   { echo -e "  ${GREEN}✅ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "  ${RED}❌ $1${NC}"; }

press_key() {
    echo ""
    echo -e "  ${GRAY}按 Enter 键继续...${NC}"
    read -r
}

# ============ 环境检测 ============
check_docker() {
    if command -v docker &>/dev/null; then
        local ver
        ver=$(docker --version 2>/dev/null || echo "")
        ok "Docker 已安装: $ver"
        return 0
    else
        err "Docker 未安装或未启动"
        return 1
    fi
}

check_compose() {
    if docker compose version &>/dev/null; then
        local ver
        ver=$(docker compose version 2>/dev/null || echo "")
        ok "Docker Compose 已安装: $ver"
        return 0
    else
        err "Docker Compose 未安装"
        return 1
    fi
}

# ============ 主流程 ============
main() {
    SKIP_PREREQ=false
    SKIP_CLONE=false
    INSTALL_PATH=""
    AUTO_CONFIG=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --skip-prereq) SKIP_PREREQ=true; shift ;;
            --skip-clone)  SKIP_CLONE=true;  shift ;;
            --path)        INSTALL_PATH="$2"; shift 2 ;;
            --auto)        AUTO_CONFIG=true; shift ;;
            *)             shift ;;
        esac
    fi

    clear
    echo ""
    banner $'██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗\n██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██║\n██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║\n██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║\n██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝\n╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝'
    echo ""
    echo -e "  ${YELLOW}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${YELLOW}║          🐳 MaiBot 可视化交互部署脚本 v1.0 (小白友好版)         ║${NC}"
    echo -e "  ${YELLOW}║          自动检测环境 · 中文引导 · 一路回车即可部署完成          ║${NC}"
    echo -e "  ${YELLOW}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # ---- 前置检查 ----
    if [[ "$SKIP_PREREQ" != true ]]; then
        step 0 "环境检测"
        echo "  检查 Docker 和 Docker Compose 是否已安装..."

        docker_ok=false
        compose_ok=false

        if check_docker; then docker_ok=true; fi
        if check_compose; then compose_ok=true; fi

        if [[ "$docker_ok" != true || "$compose_ok" != true ]]; then
            echo ""
            warn "请先安装 Docker Desktop（Linux 版）或 Docker Engine"
            echo ""
            echo "  Ubuntu/Debian 安装命令："
            echo "    curl -fsSL https://get.docker.com | sh"
            echo ""
            echo "  macOS 安装命令："
            echo "    brew install --cask docker"
            echo ""
            echo "  安装完成后再次运行本脚本"
            exit 1
        fi
    fi

    # ---- 安装路径选择 ----
    step 1 "选择安装位置"
    if [[ -z "$INSTALL_PATH" ]]; then
        DEFAULT_PATH="$HOME/MaiBot"
        echo -e "  请输入安装目录路径（直接回车使用默认路径）：${WHITE}"
        echo -e "  默认路径: ${GRAY}$DEFAULT_PATH${NC}"
        echo ""
        echo -n -e "  路径: ${WHITE}"
        read -r INSTALL_PATH
        if [[ -z "$INSTALL_PATH" ]]; then
            INSTALL_PATH="$DEFAULT_PATH"
        fi
    fi

    echo -e "  安装路径: ${WHITE}$INSTALL_PATH${NC}"

    # ---- 克隆代码 ----
    step 2 "克隆 MaiBot 源码"

    if [[ "$SKIP_CLONE" != true ]]; then
        if [[ -d "$INSTALL_PATH" ]]; then
            warn "目录已存在: $INSTALL_PATH"
            echo "  1) 重新克隆（清空目录）"
            echo "  2) 使用现有目录"
            echo ""
            echo -n -e "  选择 [1/2]: ${WHITE}"
            read -r choice
            echo -e "${NC}"

            if [[ "$choice" == "1" ]]; then
                echo -e "  ${YELLOW}正在删除旧目录...${NC}"
                rm -rf "$INSTALL_PATH"
            fi
        fi

        if [[ ! -d "$INSTALL_PATH" ]]; then
            echo -e "  ${WHITE}正在克隆 MaiBot 源码...${NC}"
            echo -e "  仓库: ${GRAY}https://github.com/MaiM-with-u/MaiBot.git${NC}"
            echo ""

            if git clone https://github.com/MaiM-with-u/MaiBot.git "$INSTALL_PATH" 2>&1; then
                ok "克隆完成"
            else
                err "克隆失败，请检查网络连接"
                exit 1
            fi
        else
            ok "使用已有目录"
        fi
    fi

    # ---- 首次启动 ----
    step 3 "首次启动（生成配置文件）"
    echo -e "  ${WHITE}现在启动 Docker 容器（首次启动会自动生成配置文件）...${NC}"
    echo -e "  ${GRAY}这可能需要几分钟，请耐心等待...${NC}"
    echo ""

    cd "$INSTALL_PATH"

    if ! docker compose up -d 2>&1; then
        err "启动失败，请运行以下命令查看日志："
        echo -e "  ${YELLOW}docker compose logs core${NC}"
        exit 1
    fi

    ok "容器启动成功！"
    echo ""
    echo -e "  ${WHITE}等待配置文件生成...${NC}"
    sleep 5

    # ---- 配置引导 ----
    step 4 "配置引导（重要！）"

    CONFIG_DIR="$INSTALL_PATH/docker-config/mmc"
    BOT_CONFIG="$CONFIG_DIR/bot_config.toml"
    MODEL_CONFIG="$CONFIG_DIR/model_config.toml"

    echo ""
    echo -e "  ${YELLOW}请按以下步骤配置（也可以直接编辑配置文件）：${NC}"
    echo ""

    # ---- QQ 配置 ----
    echo -e "  ${CYAN}=== bot_config.toml（机器人基础配置）===${NC}"
    echo ""

    if [[ -f "$BOT_CONFIG" ]]; then
        echo -e "${GRAY}"
        cat "$BOT_CONFIG"
        echo -e "${NC}"
    fi

    echo -e "  ${WHITE}请输入 QQ 号（登录机器人的 QQ 号）：${NC}"
    echo -n -e "  QQ号: ${WHITE}"
    read -r QQ_NUM

    echo -e "  ${WHITE}请输入 QQ 密码（登录密码）：${NC}"
    echo -n -e "  密码: ${WHITE}"
    read -r -s QQ_PWD
    echo -e "${NC}"

    echo ""

    # ---- AI 模型配置 ----
    echo -e "  ${CYAN}=== model_config.toml（AI 模型配置）===${NC}"
    echo ""

    if [[ -f "$MODEL_CONFIG" ]]; then
        echo -e "${GRAY}"
        cat "$MODEL_CONFIG"
        echo -e "${NC}"
    fi

    echo -e "  ${WHITE}请选择 AI 提供商：${NC}"
    echo "  1) OpenAI (ChatGPT)"
    echo "  2) 硅基流动 (SiliconFlow)"
    echo "  3) 阿里云百炼"
    echo "  4) 其他 / 手动填写"
    echo ""
    echo -n -e "  选择 [1-4]: ${WHITE}"
    read -r PROVIDER_CHOICE
    echo -e "${NC}"

    case "$PROVIDER_CHOICE" in
        1)
            echo -n -e "  ${WHITE}请输入 OpenAI API Key: ${NC}"
            read -r API_KEY
            BASE_URL="https://api.openai.com/v1"
            MODEL_NAME="gpt-4o-mini"
            ;;
        2)
            echo -n -e "  ${WHITE}请输入 SiliconFlow API Key: ${NC}"
            read -r API_KEY
            BASE_URL="https://api.siliconflow.cn/v1"
            echo -n -e "  ${WHITE}请输入模型名称 [默认: Qwen/Qwen2.5-7B-Instruct]: ${NC}"
            read -r MODEL_NAME_INPUT
            MODEL_NAME="${MODEL_NAME_INPUT:-Qwen/Qwen2.5-7B-Instruct}"
            ;;
        3)
            echo -n -e "  ${WHITE}请输入阿里云百炼 API Key: ${NC}"
            read -r API_KEY
            BASE_URL="https://dashscope.aliyuncs.com/compatible-mode/v1"
            echo -n -e "  ${WHITE}请输入模型名称 [默认: qwen-plus]: ${NC}"
            read -r MODEL_NAME_INPUT
            MODEL_NAME="${MODEL_NAME_INPUT:-qwen-plus}"
            ;;
        *)
            echo -n -e "  ${WHITE}请输入 API Key: ${NC}"
            read -r API_KEY
            echo -n -e "  ${WHITE}请输入 API Base URL: ${NC}"
            read -r BASE_URL
            echo -n -e "  ${WHITE}请输入模型名称: ${NC}"
            read -r MODEL_NAME
            ;;
    esac

    # ---- 写入配置 ----
    echo ""
    echo -e "  ${WHITE}正在写入配置文件...${NC}"

    mkdir -p "$CONFIG_DIR"

    cat > "$BOT_CONFIG" << EOF
qq = "$QQ_NUM"
password = "$QQ_PWD"
EOF

    cat > "$MODEL_CONFIG" << EOF
api_key = "$API_KEY"
base_url = "$BASE_URL"
model = "$MODEL_NAME"
EOF

    ok "配置已保存"

    # ---- 重启服务 ----
    step 5 "重启核心服务"
    echo -e "  ${WHITE}正在重启 core 容器以应用配置...${NC}"
    echo ""

    docker compose restart core 2>&1 | while IFS= read -r line; do
        echo -e "    ${GRAY}$line${NC}"
    done

    ok "重启完成！"
    echo ""
    echo -e "  ${GRAY}正在监控 core 日志（5秒后自动停止，按 Ctrl+C 可提前退出）...${NC}"
    sleep 5

    docker compose logs --tail=30 core 2>&1 | while IFS= read -r line; do
        echo -e "    ${GRAY}$line${NC}"
    done

    # ---- 完成提示 ----
    step 6 "部署完成！🎉"
    echo ""
    echo -e "  ${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "  ${GREEN}║                    访问地址汇总                              ║${NC}"
    echo -e "  ${GREEN}╠════════════════════════════════════════════════════════════╣${NC}"
    echo -e "  ${GREEN}║  🌐 Web 界面:     http://localhost:18001                   ║${NC}"
    echo -e "  ${GREEN}║  📊 数据库工具:   http://localhost:8120                    ║${NC}"
    echo -e "  ${GREEN}║  🔧 NapCat QQ:   localhost:6099                           ║${NC}"
    echo -e "  ${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "  ${WHITE}常用命令：${NC}"
    echo -e "  · 查看日志:  ${GRAY}docker compose logs -f core${NC}"
    echo -e "  · 停止服务:  ${GRAY}docker compose down${NC}"
    echo -e "  · 重启服务:  ${GRAY}docker compose restart${NC}"
    echo -e "  · 配置文件:  ${GRAY}$CONFIG_DIR${NC}"
    echo ""
    echo -e "  ${YELLOW}祝您使用愉快！有问题请查看文档或提交 Issue。${NC}"
    echo ""
}

main "$@"
