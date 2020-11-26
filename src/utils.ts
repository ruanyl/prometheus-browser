// https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
export function isValidCollectorName(name: string) {
  return !!name && /[a-zA-Z_:][a-zA-Z0-9_:]*/.test(name)
}

// https://prometheus.io/docs/concepts/data_model/#metric-names-and-labels
export function isValidLabels(labels: string[]) {
  return labels.every(label => /[a-zA-Z_][a-zA-Z0-9_]*/.test(label))
}

export function hashLabelMap(labelMap: Record<string, string>) {
  let labels = Object.keys(labelMap)
  let result = ''

  if (labels.length > 0) {
    labels = labels.sort()
    result = labels
      .map(label => {
        return `${label}:${labelMap[label]}`
      })
      .join('|')
  }

  return result
}
