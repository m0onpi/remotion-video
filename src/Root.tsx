import { staticFile } from 'remotion';
import { Composition } from 'remotion';
import { AudioGramSchema, AudiogramComposition } from './Composition';
import './style.css';
import data  from "../data.json"

const totalAudioLength = data.audioFileLengthInSeconds

const fps = 30;
const durationInFrames = totalAudioLength * fps;

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="Audiogram"
				component={AudiogramComposition}
				durationInFrames={durationInFrames+30}
				fps={fps}
				width={1080}
				height={1920}
				schema={AudioGramSchema}
				defaultProps={{
					titleColor: 'rgba(251, 176, 14, 0.93)',
					waveColor: '#ffae00',
					titleText: '',
					transcriptionColor: 'rgba(255, 255, 255, 0.93)',
					audioOffsetInFrames: 0,
					source: staticFile('subtitles.srt'),
				}}
			/>
		</>
	);
};
