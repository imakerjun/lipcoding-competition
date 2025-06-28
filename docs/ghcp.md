# GitHub Copilot 사용법

## VS Code 버전 확인

최신 버전의 [VS Code](https://code.visualstudio.com/download)로 업데이트하세요!

![VS Code 버전 확인](./images/vscode-version.png)

## GitHub Copilot 익스텐션 설치

GitHub Copilot 관련 익스텐션을 설치하세요!

![VS Code 익스텐션](./images/vscode-extensions.png)

- [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [GitHub Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)
- [VS Code Speech](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-speech)

## GitHub Copilot 활성화

VS Code 설정에서 GitHub Copilot 에이전트 모드가 활성화 되어 있는지 확인하세요! 기본값으로 활성화가 되어 있지만 다시 한 번 확인하세요!

![GHCP 에이전트 모드 활성화](./images/vscode-ghcp-agent.png)

## 음성 인식 한국어 설정

VS Code 설정에서 음성 인식 기능을 한국어로 설정하세요! 다음 단계를 따라 설정할 수 있습니다:

### 방법 1: 설정 UI 사용
1. **VS Code 설정 열기**: `Ctrl+,` (Windows/Linux) 또는 `Cmd+,` (macOS)
2. **음성 설정 검색**: 검색창에 "speech" 입력
3. **언어 설정 변경**: 
   - `Speech: Language` 설정을 찾아서 `auto`에서 `ko-KR` (Korean - South Korea)로 변경
   - 또는 설정에서 `"speech.language": "ko-KR"`로 직접 설정

### 방법 2: settings.json 직접 편집
1. `Ctrl+Shift+P` (Windows/Linux) 또는 `Cmd+Shift+P` (macOS)로 명령 팔레트 열기
2. "Preferences: Open Settings (JSON)" 검색 후 선택
3. 다음 설정 추가:
   ```json
   {
     "speech.language": "ko-KR"
   }
   ```

기본값은 `auto`이지만 `Korean (South Korea)`로 강제 설정하면 한국어 인식률이 크게 향상됩니다.

![VS Code 음성 인식 언어 설정](./images/vscode-settings-voice.png)

## GitHub Copilot 에이전트 모드 확인

GitHub Copilot 아이콘을 클릭해서 GitHub Copilot 에이전트 창을 열어보세요.

![GHCP 창](./images/vscode-ghcp.png)

GitHub Copilot 에이전트 모드를 선택하세요.

![GHCP 에이전트 모드 선택](./images/vscode-ghcp-agent.png)

생성형 AI 모델은 `GPT-4.1` 또는 `Claude Sonnet 4`를 선택하세요.

![GHCP 에이전트 모델 선택](./images/vscode-ghcp-model.png)

필요한 경우 [GitHub Copilot](https://github.com/settings/copilot/features) 메뉴에서 무료 기능 활성화를 시킬 수 있습니다. 만약 무료 기능 활성화를 했는데도 문제가 생긴다면 한달짜리 Pro 버전 무료 트라이얼을 활성화 시킬 수도 있습니다.

## MCP 서버 설정

필요한 경우 다양한 MCP 서버를 추가할 수 있습니다. `F1` 👉 `MCP: Add Server...` 메뉴를 선택해서 필요한 MCP 서버를 연동하세요. 더 자세한 내용은 [Use MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) 문서를 참조하세요.

## 커스텀 지시사항 설정

GitHub Copilot이 이 프로젝트의 요구사항과 맥락을 항상 기억하도록 **Custom Instructions**를 설정하세요!

### 자동 설정 (권장)
이 프로젝트에는 이미 `.github/copilot-instructions.md` 파일이 준비되어 있습니다. 이 파일에는 다음 내용들이 포함되어 있습니다:

- 📋 프로젝트 요구사항 문서 참조
- 🛠️ 기술 스택 및 개발 지침
- 🎯 핵심 기능 및 우선순위
- ⚠️ 주의사항 및 보안 고려사항
- 🎨 UI/UX 요구사항

### 수동 설정 방법
1. **커스텀 지시사항 파일 생성**:
   ```bash
   # 프로젝트 루트에서
   mkdir -p .github
   touch .github/copilot-instructions.md
   ```

2. **VS Code에서 확인**:
   - `F1` → "Developer: Reload Window" 실행
   - GitHub Copilot Chat에서 프로젝트 맥락이 자동으로 로드됨

3. **설정 확인**:
   GitHub Copilot Chat에 "이 프로젝트의 요구사항을 알고 있나요?"라고 물어보세요.

더 자세한 내용은 [Customize AI responses in VS Code](https://code.visualstudio.com/docs/copilot/copilot-customization) 문서를 참조하세요.
