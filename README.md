# Wecandeo VideoPack v4 MCP Server

Wecandeo VideoPack v4 API를 위한 MCP(Model Context Protocol) 서버입니다.
Claude Desktop, Claude Code, Cursor 등 MCP 클라이언트에서 위캔디오 비디오팩 전반 기능(업로드 · 인코딩 · 배포 · 미디어 보관함)을 Stdio 모드로 사용할 수 있습니다.

- **홈페이지**: [https://www.wecandeo.com](https://www.wecandeo.com)
- **API 가이드**: [https://support.wecandeo.com/v4.0](https://support.wecandeo.com/v4.0)

> 위캔디오 비디오팩 MCP는 기능별로 세 개의 서버로 구성됩니다.
> - `@wecandeo/wecandeo-v4-mcp` — 비디오팩 전반 기능 (본 서버)
> - `@wecandeo/wecandeo-v4-analytics-mcp` — 통계
> - `@wecandeo/wecandeo-v4-ai-mcp` — AI 기능

## 설치 및 실행

### 환경 변수

| 변수 | 설명 |
|---|---|
| `WECANDEO_API_KEY` | Wecandeo API 키 (필수) |

- **API 키 확인 방법**: [비디오팩 API 시작하기](https://support.wecandeo.com/reference/videopack-api-getting-started) 가이드를 참고하세요.

### npx로 실행 (권장)

```bash
WECANDEO_API_KEY=your_key npx @wecandeo/wecandeo-v4-mcp
```

### Claude Desktop / Cursor 설정

`claude_desktop_config.json` 또는 `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "wecandeo-v4": {
      "command": "npx",
      "args": ["-y", "@wecandeo/wecandeo-v4-mcp"],
      "env": {
        "WECANDEO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Claude Code 설정

`~/.claude.json` (글로벌) 또는 프로젝트 `.mcp.json`:

```json
{
  "mcpServers": {
    "wecandeo-v4": {
      "command": "npx",
      "args": ["@wecandeo/wecandeo-v4-mcp"],
      "env": {
        "WECANDEO_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### 소스에서 직접 실행

```bash
npm install && npm run build
WECANDEO_API_KEY=your_key node dist/index.js
```

## 파일 업로드 (로컬 파일 + URL 지원)

`wecandeo_upload_video`, `wecandeo_upload_thumbnail`, `wecandeo_upload_caption` 의 `source` 인자는
**로컬 파일 경로**(예: `/Users/me/clip.mp4`, `./caption.vtt`)와 **원격 URL**(`http(s)://...`)을 모두 지원합니다.
로컬 경로인 경우 파일을 직접 읽어 업로드하고, URL인 경우 다운로드 후 업로드합니다.

업로드 흐름:
1. `wecandeo_upload_create_token` 으로 토큰과 업로드 URL들을 발급받습니다. (토큰 1개당 파일 1개)
2. `wecandeo_upload_video` 로 동영상을 업로드합니다.
3. `wecandeo_upload_video_status` / `wecandeo_upload_video_progress` 로 진행 상태를 확인합니다.
4. (선택) `wecandeo_upload_thumbnail`, `wecandeo_upload_caption` 으로 썸네일/자막을 추가합니다.

## 제공 도구

| 그룹 | 도구 | 설명 |
|---|---|---|
| **Upload** | `wecandeo_upload_create_token` | 업로드 토큰 발급 (V4) |
| | `wecandeo_upload_video` | 동영상 업로드 (로컬 파일/URL) |
| | `wecandeo_upload_video_status` | 업로드 상태 조회 |
| | `wecandeo_upload_video_progress` | 업로드 진행률 조회 |
| | `wecandeo_video_encoding_status` | 인코딩 상태 조회 |
| | `wecandeo_upload_thumbnail` | 썸네일 업로드 (로컬 파일/URL) |
| | `wecandeo_upload_caption` | 자막(WebVTT) 업로드 (로컬 파일/URL) |
| | `wecandeo_upload_caption_language` | 자막 언어 코드 목록 |
| **Video Retrieve** | `wecandeo_video_list_package` | 패키지별 동영상 목록 |
| | `wecandeo_video_list_folder` | 폴더별 동영상 목록 |
| | `wecandeo_video_details` | 동영상 상세 (legacy) |
| | `wecandeo_video_details_v4` | 동영상 상세 (v4, AI 요약 포함) |
| | `wecandeo_video_pub_code` | 배포 코드 조회 |
| | `wecandeo_video_encoded_file` | 인코딩 파일 목록 |
| | `wecandeo_video_onetime_key` | 원타임 키 발급 |
| | `wecandeo_video_thumbnail` | 썸네일 이미지 조회 |
| | `wecandeo_video_caption` | 자막 파일 조회 |
| **Video Update** | `wecandeo_video_add_to_package` | 패키지에 추가 |
| | `wecandeo_video_exclude_from_package` | 패키지에서 제외 |
| | `wecandeo_video_start_publish` | 배포 시작 |
| | `wecandeo_video_pause_publish` | 배포 중지 |
| | `wecandeo_video_modify_folder` | 보관함 폴더 이동 |
| | `wecandeo_video_modify_meta` | 메타데이터 수정 |
| | `wecandeo_video_set_default_thumbnail` | 대표 썸네일 설정 |
| **Package** | `wecandeo_package_list` | 배포 패키지 목록 |
| **Archive** | `wecandeo_archive_create_folder` | 동영상 폴더 생성 |
| | `wecandeo_archive_list_folders` | 동영상 폴더 목록 |
| | `wecandeo_archive_folder_by_name` | 폴더명으로 조회 |
| | `wecandeo_archive_original_download_url` | 원본 다운로드 URL 조회 |
| *(공통)* | `ping` | 서버 응답 확인 |

## API 호스트 참고

- 레거시 엔드포인트: `https://api.wecandeo.com` (인증: `key` 쿼리 파라미터)
- v4 네이티브 엔드포인트: `https://api.v4.wecandeo.com` (인증: `x-api-key` 헤더) — `wecandeo_video_details_v4`, `wecandeo_archive_original_download_url`
