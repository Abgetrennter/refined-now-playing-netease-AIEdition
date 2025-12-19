<div lang="zh-CN">

# Refined Now Playing (AI Edition) 🎵

一个基于 [BetterNCM](https://github.com/MicroCBer/BetterNCM) 平台的高性能网易云音乐播放界面美化插件，采用现代化的 Material You 设计语言，提供沉浸式的音乐体验。

[![Version](https://img.shields.io/badge/version-2.19.5-blue.svg)](https://github.com/solstice23/refined-now-playing-netease)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue.svg)](tsconfig.json)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](package.json)

## 🌟 核心特性

### 🎨 智能主题系统
- **Material You 动态配色**: 自动从专辑封面提取主色调，生成完整的 Material Design 3 色彩系统
- **实时色彩适配**: 支持 Vibrant、Tonal、Content 等多种配色策略
- **智能对比度**: 自动调整文本和背景对比度，确保最佳可读性

### 🌊 沉浸式背景系统
- **流体背景 (Fluid)**: 基于 WebGL 和 Canvas 的高性能流体动画，支持音频响应
- **智能模糊 (Blur)**: 封面高斯模糊效果，支持平滑过渡动画
- **动态渐变 (Gradient)**: 基于封面色彩提取的智能渐变背景
- **纯色模式 (Solid)**: 简约纯色背景，适合低功耗场景

### 🎤 增强歌词系统
- **逐字歌词 (Karaoke)**: 支持 YRC 格式逐字歌词，提供 Float 和 Slide 动画效果
- **多语言支持**: 原词、翻译、罗马音自由切换
- **智能滚动**: 防遮挡算法、平滑滚动、间奏跳过
- **高光特效**: Web Animations API 实现的动态扫光效果
- **概览模式**: 全文预览和复制功能

### 🎯 UI 增强功能
- **重构控制栏**: 重新设计的底部控制栏，显示精确播放时间
- **迷你歌曲信息**: 左下角常驻显示当前歌曲信息
- **进度条预览**: 悬停进度条显示时间点预览
- **智能右键菜单**: 封面和歌词区域的自定义右键功能
- **私人 FM 适配**: 完美支持私人 FM 模式

## 🏗️ 技术架构

### 核心技术栈
- **框架**: React 18.2 + TypeScript 5.9
- **构建工具**: Webpack 5 + Babel
- **样式系统**: SCSS + CSS Variables
- **图形渲染**: WebGL + Canvas 2D + SVG Filters
- **颜色算法**: Google Material Color Utilities + ColorThief
- **插件平台**: BetterNCM Plugin API

### 性能优化
- **虚拟化渲染**: 歌词列表虚拟化，支持大数据量流畅滚动
- **WebGL 优化**: 流体背景使用着色器加速，支持帧率限制
- **内存管理**: 智能资源回收和缓存策略
- **防抖节流**: 高频事件优化处理

### 模块化设计
```
src/
├── components/          # React 组件
│   ├── background/     # 背景系统组件
│   ├── lyrics/         # 歌词系统组件
│   └── ...
├── modules/            # 功能模块
│   ├── settings/       # 设置管理
│   ├── theme/          # 主题系统
│   └── ui/             # UI 增强
├── core/               # 核心功能
├── utils/              # 工具函数
└── types/              # TypeScript 类型定义
```

## 🚀 快速开始

### 环境要求
- 网易云音乐客户端 (最新版本)
- [BetterNCM](https://github.com/MicroCBer/BetterNCM) 插件管理器 (≥1.0.0)
- Windows 10/11 或 macOS 10.15+

### 安装步骤

1. **安装 BetterNCM**
   ```bash
   # 下载 BetterNCM 安装器
   # 运行安装器并按照提示完成安装
   ```

2. **获取插件**
   - 方式一：BetterNCM 插件商店搜索 "RefinedNowPlaying"
   - 方式二：手动下载最新版本并解压到 `BetterNCM/plugins` 目录

3. **启用插件**
   - 启动网易云音乐
   - 打开 BetterNCM 插件管理界面
   - 启用 "RefinedNowPlaying" 插件
   - 进入"正在播放"页面即可看到效果

### 构建开发版本

```bash
# 克隆项目
git clone https://github.com/solstice23/refined-now-playing-netease.git
cd refined-now-playing-netease

# 安装依赖
npm install

# 开发模式
npm run build:dev

# 生产构建
npm run build:prod

# 监听模式
npm run watch
```

## ⚙️ 配置选项

### 外观设置
- **配色方案**: Auto (自动提取) / Preset (预设主题)
- **主题变体**: Vibrant / Tonal / Content / Expressive
- **文本效果**: 阴影 / 发光 / 描边
- **布局模式**: 独占模式、控制栏样式

### 歌词设置
- **基础显示**: 字体大小、翻译、罗马音、原词加粗
- **视觉特效**: 逐字动画、模糊、缩放、3D旋转、高光
- **滚动行为**: 对齐位置、全局偏移、间奏处理

### 背景设置
- **背景类型**: Fluid / Blur / Gradient / Solid / None
- **流体设置**: 静态模式、最大帧率、遮罩浓度
- **性能优化**: GPU加速、帧率限制、资源管理

## 📸 效果预览

### 演示视频
[观看完整演示视频](https://user-images.githubusercontent.com/23134847/216518149-9d85c6a6-4ad5-4c2c-9843-a2f65f610fd0.mp4)

### 截图展示
<table>
  <tr>
    <td><img src="screenshot1.jpg" alt="流体背景效果" width="400"/></td>
    <td><img src="screenshot2.jpg" alt="歌词系统界面" width="400"/></td>
  </tr>
  <tr>
    <td><img src="screenshot3.jpg" alt="Material You主题" width="400"/></td>
    <td><img src="screenshot4.jpg" alt="设置面板界面" width="400"/></td>
  </tr>
</table>

## 🛠️ 开发文档

### 项目结构
详细的项目架构和模块说明请参考 [项目概述](wiki/项目概述.md)

### API 文档
完整的 API 文档和开发指南请查看 [API文档](wiki/API文档.md)

### 模块介绍
各功能模块的详细实现说明请参考 [具体模块介绍](wiki/具体模块介绍.md)

### 性能优化
性能优化和重构计划请参考 [优化方向](wiki/优化方向.md)

### 迁移指南
TypeScript 迁移计划请参考 [迁移计划](MIGRATION_PLAN.md)

## 🤝 贡献指南

我们欢迎社区贡献！请查看以下文档：

1. [开发环境搭建](wiki/开发指南.md)
2. [代码规范](.github/CONTRIBUTING.md)
3. [提交规范](.github/PULL_REQUEST_TEMPLATE.md)

### 开发流程
1. Fork 项目并创建功能分支
2. 遵循 TypeScript 和 React 最佳实践
3. 添加适当的测试用例
4. 提交 Pull Request 并描述变更内容

## 📋 兼容性信息

### 支持的网易云音乐版本
- 客户端版本: 2.10.4+
- BetterNCM 版本: ≥1.0.0

### 插件兼容性
- **推荐搭配**: MaterialYouTheme, LibFrontendPlay, SimpleAudioVisualizer
- **不兼容插件**: Apple-Musiclike-lyrics

### 系统要求
- **最低配置**: 4GB RAM, 支持 WebGL 的显卡
- **推荐配置**: 8GB RAM, 独立显卡, SSD 存储

## 📝 许可证

本项目基于 [MIT 许可证](LICENSE) 开源发布。

## 🙏 致谢

- [BetterNCM](https://github.com/MicroCBer/BetterNCM) - 插件平台
- [Google Material Design](https://m3.material.io/) - 设计系统
- [React](https://reactjs.org/) - UI 框架
- 所有贡献者和社区支持者

## 📞 支持与反馈

- **问题反馈**: [GitHub Issues](https://github.com/solstice23/refined-now-playing-netease/issues)
- **功能建议**: [GitHub Discussions](https://github.com/solstice23/refined-now-playing-netease/discussions)
- **使用教程**: [使用教程](wiki/使用教程.md)

---

<div align="center">
  <p><strong>Refined Now Playing</strong> - 让音乐体验更加精致</p>
  <p>Made with ❤️ by the community</p>
</div>

</div>
