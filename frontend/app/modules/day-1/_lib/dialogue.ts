export class DialogueLine {
  readonly text: string
  readonly taskMode: boolean
  readonly highlightTask: boolean
  readonly completion: boolean
  readonly ending: boolean

  constructor({
    text,
    taskMode = false,
    highlightTask = false,
    completion = false,
    ending = false,
  }: {
    text: string
    taskMode?: boolean
    highlightTask?: boolean
    completion?: boolean
    ending?: boolean
  }) {
    this.text = text
    this.taskMode = taskMode
    this.highlightTask = highlightTask
    this.completion = completion
    this.ending = ending
  }

  static info(text: string) {
    return new DialogueLine({ text })
  }

  static task(text: string) {
    return new DialogueLine({ text, taskMode: true, highlightTask: true })
  }

  static completion(text: string) {
    return new DialogueLine({ text, completion: true })
  }

  static ending(text: string) {
    return new DialogueLine({ text, ending: true })
  }
}

export const DAY1_LINES: readonly DialogueLine[] = Object.freeze([
  DialogueLine.info("Hello! I'm your Day 1 guide."),
  DialogueLine.info(
    "Enzymes are helper proteins. They speed up reactions without being used up.",
  ),
  DialogueLine.info(
    "A substrate is the molecule an enzyme works on. It has to fit the enzyme's active site.",
  ),
  DialogueLine.task(
    "Your task: drag the substrate piece into the matching enzyme pocket.",
  ),
  DialogueLine.completion(
    "Great job! You formed the enzyme-substrate complex.",
  ),
  DialogueLine.ending("Congratulations! You've reached the end of this activity."),
])

export const TASK_LINE_INDEX = DAY1_LINES.findIndex((line) => line.taskMode)
export const SUCCESS_LINE_INDEX = DAY1_LINES.findIndex((line) => line.completion)
export const END_LINE_INDEX = DAY1_LINES.findIndex((line) => line.ending)

