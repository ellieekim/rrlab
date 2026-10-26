# RRLab 홈페이지

세종대학교 레이다 연구실(Radar Research Laboratory) 홈페이지입니다. [Hugo](https://gohugo.io)로 만들었고, GitHub Pages에 자동 배포됩니다.

## 내용 수정하기

대부분의 수정은 `data/` 폴더의 YAML 파일 한 곳만 고치면 됩니다.

| 바꿀 내용 | 파일 |
|---|---|
| 논문, 학술대회, 특허 | `data/publications.yml` |
| 연구과제 | `data/projects.yml` |
| 교수, 학생, 졸업생 | `data/members.yml` |
| 연구 분야 소개 | `data/research.yml` |
| 홈 화면 문구와 연구 주제 | `content/_index.md` |
| 연락처, 주소 | `hugo.toml` 의 `[params]` |
| 소식, 모집 공고 | `content/news/` 에 Markdown 파일 추가 |

자주 하는 작업:

- **논문 추가**: `data/publications.yml` 의 해당 목록 맨 위에 항목을 추가합니다. 페이지에서는 연도순으로 정렬됩니다. `tags: [mimo]` 처럼 연구 분야 key를 넣으면 Research 페이지의 "관련 논문"에도 나옵니다.
- **학생 졸업**: `data/members.yml` 의 `students` 에서 지우고 `alumni` 에 이름과 소속을 한 줄 추가합니다.
- **소식 올리기**: `content/news/2027-01-award.md` 처럼 파일을 만들고 맨 위에 `title`, `date`, `summary` 를 적습니다. `featured: true` 를 넣으면 홈 화면에서 강조됩니다.
- **사진 넣기**: `static/images/members/`, `static/images/research/` 에 파일을 넣고 YAML의 `photo` / `image` 경로와 맞춥니다. 파일이 없으면 이니셜이나 자리표시 그림이 대신 나옵니다.

연구과제의 `end` 가 현재 달 이후이면 "진행 중"으로 자동 표시됩니다.

## 로컬에서 미리보기

```bash
# macOS
brew install hugo
hugo server
# http://localhost:1313 에서 확인 (저장하면 자동 새로고침)
```

## 배포 (처음 한 번)

1. GitHub에 저장소를 만들고 이 폴더를 push합니다.
2. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 바꿉니다.
3. 이후 `main` 브랜치에 push할 때마다 `.github/workflows/hugo.yml` 이 자동으로 빌드·배포합니다.

### 도메인 연결

- 저장소 이름을 `<GitHub 아이디>.github.io` 로 하면 `https://<아이디>.github.io` 에 바로 게시됩니다.
- 학교 도메인(예: `rrlab.sejong.ac.kr`)을 쓰려면 학교 전산팀에 CNAME 레코드를 `<아이디>.github.io` 로 요청하고, Settings → Pages → Custom domain 에 입력합니다.
- `hugo.toml` 의 `baseURL` 도 실제 주소로 바꿔 주세요.

## 구조

```
data/          콘텐츠 데이터 (논문, 과제, 구성원, 연구 분야)
content/       페이지와 소식 글
layouts/       HTML 템플릿
static/        CSS, JS, 이미지
```
