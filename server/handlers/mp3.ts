import { HandlerProps } from '../server'
import ytdl from 'ytdl-core'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'

export default async ({ response, videoId, streamPipeline }: HandlerProps): Promise<void> => {
    void streamPipeline
    try {
        const videoInfo = await ytdl.getInfo(videoId)
        const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio', filter: 'audioonly' })

        if (!audioFormat) {
            response.status(404).json({ error: 'No suitable format found' })
            return
        }

        const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat })
        response.setHeader('Content-Disposition', `attachment; filename="${videoInfo.videoDetails.title}.mp3"`)
        response.setHeader('Content-Type', 'audio/mpeg')
        if (audioFormat.contentLength) response.setHeader('Content-Length', audioFormat.contentLength.toString())

        const ffmpegProcess = ffmpeg({ source: audioStream, timeout: 0 })
            .setFfmpegPath(ffmpegInstaller.path)
            .audioCodec('libmp3lame')
            .audioBitrate(192)
            .format('mp3')
            .on('start', () => console.log('Started streaming audio'))
            .on('end', () => {
                console.log('Finished streaming audio')
                response.end()
            })
            .on('error', (error: Error) => {
                console.error(`Error streaming audio: ${error.message}`)
                ffmpegProcess.kill('SIGKILL')
                if (!response.headersSent)
                    response.status(500).json({ error: error.message })
            })

        ffmpegProcess.pipe(response, { end: true })
    } catch (error: any) {
        console.error(`Error downloading audio: ${error.message}`)
        response.status(500).json({ error: error.message })
    }
}