import { Sample } from './Collector'

// https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
export function isValidCollectorName(name: string) {
  return !!name && /[a-zA-Z_:][a-zA-Z0-9_:]*/.test(name)
}

// https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
export function isValidLabels(labels: string[]) {
  return labels.every((label) => /[a-zA-Z_][a-zA-Z0-9_]*/.test(label))
}

export function hashLabelMap(labelMap: Record<string, string>) {
  let labels = Object.keys(labelMap)
  let result = ''

  if (labels.length > 0) {
    labels = labels.sort()
    result = labels
      .map((label) => {
        return `${label}:${labelMap[label]}`
      })
      .join('|')
  }

  return result
}

export function convertSamplesToText(samples: Sample[]) {
  const textSamples: string[] = []

  for (const sample of samples) {
    const labelInText = Object.entries(sample.labels).map(([label, value]) => {
      return `${label}="${value}"`
    })

    const sampleInText =
      labelInText.length > 0
        ? `${sample.name}{${labelInText}} ${sample.value}\n`
        : `${sample.name} ${sample.value}\n`
    textSamples.push(sampleInText)
  }

  return textSamples
}
