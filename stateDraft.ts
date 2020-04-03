type ReduxDraftStore = {
  notes: {
    activeNotes: [{
			note: number,
			velocity: number,
			isReleased: boolean,
			isSostenuto: boolean
		}],
    isSustainActive: boolean,
    isSostenutoActive: boolean
  },
  settings: {
    baseFrequency: number,
    polyphony: number
  },
  sound: {
    oscillators: [
      {
				id: number,
				title: string,
        mode: 'ratio' | 'fixed',
				ratio: number,
				frequency: number,
        waveType: OscillatorType,
        envelope: {
          attack: number,
          decay: number,
          sustain: number,
          release: number
        }
      }
    ]
  }
}



type reduxDraftState = {
	midiControl: {
		devices: {
			'-1841601646': {
				name: 'Samson Graphite M25',
				mapping: {
					'123': '1skf93jd.frequency',
					'124': '1skf93jd.amplitude'
				}
			},
			'Sound Controller Series X': {
				mapping: {
					'124': '__OUTPUT__.amplitude'
				}
			}
		}
	},
	sound: {
		oscillators: [
			{
				id: '1skf93jd',
				mode: 'ratio' | 'fixed',
				// Use ratio OR frequency? Or use same param for both modes?
				ratio?: 2.5,
				frequency?: 6,
				waveType: 'sine' as OscillatorType,
				envelope: {
					// Values in milliseconds (sustain in % perceived volume as a decimal)
					attack: 2,
					decay: 150,
					sustain: 0.5,
					release: 2000
				}
			}
		],
		mapping: [
			{
				from: '1skf93jd',
				to: '1skf93jd',
				param: 'frequency' as 'frequency' | 'amplitude',
				depth: 100,
				preEnvelope: true
			},
			{
				from: '1skf93jd',
				to: '__OUTPUT__',
				param: null,
				preEnvelope: false
			}
		],
		baseFrequency: 440,
		polyphony: 1
	}
}
