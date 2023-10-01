
import stable_whisper

model = stable_whisper.load_model('base')
result = model.transcribe('public/output_0.mp3')
result.to_srt_vtt('public/subtitles.srt',tag=("",""),segment_level=False,word_level=True)
