import {
  Add01Icon,
  AiBrain01Icon,
  AiSparklesIcon,
  Airplane01Icon,
  BotIcon,
  Calculator01Icon,
  FileDiffIcon,
  Folder01Icon,
  GitPullRequestIcon,
  GlobeIcon,
  PencilEdit01Icon,
  SearchIcon,
  SourceCodeIcon,
  SunCloud01Icon,
} from "@hugeicons/core-free-icons";

export const iconMap = {
  bot: BotIcon,
  model: AiSparklesIcon,
  weather: SunCloud01Icon,
  "web-research": SearchIcon,
  travel: Airplane01Icon,
  writing: PencilEdit01Icon,
  coding: SourceCodeIcon,
  "pr-review": GitPullRequestIcon,
  blank: Add01Icon,
  calculator: Calculator01Icon,
  web_search: SearchIcon,
  read_webpage: GlobeIcon,
  github_read_file: Folder01Icon,
  github_search_code: SourceCodeIcon,
  github_get_pr: GitPullRequestIcon,
  github_get_diff: FileDiffIcon,
  memory: AiBrain01Icon,
};

export type IconName = keyof typeof iconMap;
