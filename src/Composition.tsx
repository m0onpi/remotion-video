import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import { Gif } from '@remotion/gif'
import React, { useEffect, useRef, useState } from 'react';
import { fontFamily, loadFont } from "@remotion/google-fonts/Montserrat";
import { interpolate, Easing} from 'remotion';
import { LinearWipe } from './LinearWipe';
import TransitionSeries  from './TransitionSeries'
import { Dissolve } from './Dissolve';
loadFont("normal", {
	weights: ["800"],
  });
import {
	AbsoluteFill,
	Audio,
	continueRender,
	delayRender,
	Img,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
	Series,
	staticFile,
	Video,
} from 'remotion';
import { LINE_HEIGHT, PaginatedSubtitles } from './Subtitles';
import { z } from 'zod';
import { zColor } from '@remotion/zod-types';
import data from '../data.json'
import person from '../image_urls.json'
import { Pan } from './Pan';
export const AudioGramSchema = z.object({
	titleText: z.string(),
	titleColor: zColor(),
	waveColor: zColor(),
	transcriptionColor: zColor(),
});

type MyCompSchemaType = z.infer<typeof AudioGramSchema>;

const AudioViz: React.FC<{ waveColor: string }> = ({ waveColor }) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();
	const audioData = useAudioData(audioSource);

	if (!audioData) {
		return null;
	}

	const allVisualizationValues = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples: 256, // Use more samples to get a nicer visualisation
	});

	// Pick the low values because they look nicer than high values
	// feel free to play around :)
	const visualization = allVisualizationValues.slice(7, 30);

	const mirrored = [...visualization.slice(1).reverse(), ...visualization];

	return (
		<div className="audio-viz">
			{mirrored.map((v, i) => {
				return (
					<div
						key={i}
						className="bar"
						style={{
							backgroundColor: waveColor,
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};

export const AudiogramComposition: React.FC<
	{
		source: string;
		audioOffsetInFrames: number;
	} & MyCompSchemaType
> = ({
	source,
	audioOffsetInFrames,
	titleColor,
	transcriptionColor,
	waveColor,
}) => {
	const { durationInFrames } = useVideoConfig();

	const [handle] = useState(() => delayRender());
	const [subtitles, setSubtitles] = useState<string | null>(null);
	const ref = useRef<HTMLDivElement>(null);
	const frame = useCurrentFrame();
	const OpacityOut = interpolate(frame, [0, durationInFrames], [1, 0], {

		extrapolateRight: "clamp",
	  })
	  const OpacityImg = interpolate(frame, [0, 90], [1, 0], {

		extrapolateRight: "clamp",
	  })
	const OpacityIn = interpolate(frame, [0, durationInFrames], [0, 1], {

	extrapolateRight: "clamp",
	})
	const AnimLeft = interpolate(frame, [0, 60], [0, -20], {

		extrapolateRight: "clamp",
		extrapolateLeft: "clamp",

		})

	const videoList = Array.from({length: data.videoUrls.length}, (_,index) => index +1)
	const easeInOutExp = Easing.inOut(Easing.exp);


	useEffect(() => {
		fetch(source)
			.then((res) => res.text())
			.then((text) => {
				setSubtitles(text);
				continueRender(handle);
			})
			.catch((err) => {
				console.log('Error fetching subtitles', err);
			});
	}, [handle, source]);

	if (!subtitles) {
		return null;
	}

	return (
		<>
		<AbsoluteFill>
		<div
  ref={ref}
  style={{ 
    position: "relative",
    backgroundColor: "black",
    width: "100%",
    height: "100%"
  }}
>			


<AbsoluteFill>
	
			<Audio src={staticFile("napo.mp3")} 
			 volume={(f) =>
				interpolate(f, [5*30, 10*30], [0.075, 0.15], { extrapolateLeft: "clamp",extrapolateRight: "clamp"})
			  }
			startFrom={7*30}/>
			</AbsoluteFill>
			<AbsoluteFill>
			<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={60}>
	<AbsoluteFill style={{     left:"-90%", width: undefined,
    height: "120%",
    aspectRatio: 1}}>
  <Img src={data.personImage.url}/>
  </AbsoluteFill>
  </TransitionSeries.Sequence>

  <TransitionSeries.Transition
    durationInFrames={30}
    transitionComponent={(props) => (
		<Pan {...props} />
	  )}
  />

  <TransitionSeries.Sequence>
	<AbsoluteFill>
  <Video 
			loop
			endAt={120}
              src={data.videoUrls[0]}
			  style={{
				right:"40%",
				width: "100%",

			  }}
            />

			</AbsoluteFill>
	
  </TransitionSeries.Sequence>
</TransitionSeries>
<AbsoluteFill>
{videoList.map((videoL,index) => (
	<Sequence from ={(videoL*90)+60} >
	<AbsoluteFill>
  <Video key={index} 
			  endAt={((videoL+1)+90)}
              src={data.videoUrls[index+1]}
			  style={{
				right:"40%",
				width: "100%",

			  }}
            />

			</AbsoluteFill>
			</Sequence>))}
</AbsoluteFill>


</AbsoluteFill>

			<Img 
  style={{
    position: "absolute",
    top: "95%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "8%", 
    height: "auto", 
    opacity: 0.5, 
  }} 
  src={staticFile("chess_logo.png")}
/>
            <Audio src={staticFile(`output_0.mp3`)}/>
			
      <div
        style={{
			
          fontFamily,
          position: "absolute",
		  left:"2.5%",
          top: "100%",
          width: "95%",
		  height:"100%",
          textAlign: "center",
          transform: "translateY(-50%)",
		  fontSmooth: "always"

        }}
      >
        <div className="captions">
          <PaginatedSubtitles
            subtitles={subtitles}
            startFrame={0}
            endFrame={durationInFrames}
            linesPerPage={4}
            transcriptionColor="white" // Set the transcription text color to white for better visibility
          />

        </div>
		
      </div>
</div>

</AbsoluteFill>
</>
	);
};
