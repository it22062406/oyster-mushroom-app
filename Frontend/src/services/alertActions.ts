export type FarmAlert = {
  id: string;
  type: 'temperature' | 'humidity' | 'tsi';
  severity: 'warning' | 'critical';
  message: string;
  value?: number;
  threshold?: number;
  timestamp?: number;
};

export function actionForAlert(alert: FarmAlert): { title: string; steps: string[] } {
  if (alert.type === 'temperature') {
    const tooHot = (alert.value ?? 0) >= (alert.threshold ?? 32);
    if (tooHot) {
      return {
        title: 'Cool the grow room',
        steps: [
          'Open ventilation or switch on the exhaust fan.',
          'Turn heaters down and keep bags out of direct sun.',
          'Please turn the water mist machine on so the grow room stays moist enough for the mushrooms.',
        ],
      };
    }
    return {
      title: 'Warm the grow room',
      steps: [
        'Close drafts and reduce cold air from outside.',
        'Add gentle heat. Do not place a heater against the bags.',
        'Please turn the water mist machine on so the grow room stays moist enough for the mushrooms.',
      ],
    };
  }

  if (alert.type === 'humidity') {
    const tooDry = (alert.value ?? 0) <= (alert.threshold ?? 65);
    if (tooDry) {
      return {
        title: 'Raise the humidity',
        steps: [
          'Mist the room or turn on the humidifier.',
          'Avoid leaving doors open while the air is dry.',
          'Please turn the water mist machine on so the grow room stays moist enough for the mushrooms.',
        ],
      };
    }
    return {
      title: 'Lower the humidity',
      steps: [
        'Increase fresh-air exchange so moisture can leave the room.',
        'Reduce misting until water is no longer beading on the bags.',
        'Please turn the water mist machine on so the grow room stays moist enough for the mushrooms.',
      ],
    };
  }

  if (alert.severity === 'critical') {
    return {
      title: 'Stabilize the room now',
      steps: [
        'Check temperature and humidity immediately. Stress is already critical.',
        'Ventilate, then correct whichever reading is outside 20–28°C or 80–95% humidity.',
        'Please turn the water mist machine on so the grow room stays moist enough for the mushrooms.',
      ],
    };
  }

  return {
    title: 'Adjust before stress gets worse',
    steps: [
      'Look at the latest temperature and humidity on the moisture dashboard.',
      'Adjust ventilation or humidity so the room stays at 20–28°C and 80–95% humidity.',
      'Please turn the water mist machine on so the grow room stays moist enough for the mushrooms.',
    ],
  };
}
