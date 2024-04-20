import { HandlerProps } from '../server'
import ytdl from 'ytdl-core'

export default async ({ response, videoId, streamPipeline }: HandlerProps): Promise<void> => {
    try {
        const videoInfo = await ytdl.getInfo(videoId)
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo', filter: 'audioandvideo' })

        if (!videoFormat) {
            response.status(404).json({ error: 'No suitable format found' })
            return
        }

        const videoStream = ytdl.downloadFromInfo(videoInfo, { format: videoFormat })
        response.setHeader('Content-Disposition', `attachment; filename="${videoInfo.videoDetails.title}.mp4"`)
        response.setHeader('Content-Type', 'video/mp4')
        if (videoFormat.contentLength) response.setHeader('Content-Length', videoFormat.contentLength.toString())

        console.log('Started streaming video')
        await streamPipeline(videoStream, response)
        console.log('Finished streaming response')
    } catch (error: any) {
        console.error(`Error downloading video: ${error.message}`)
        response.status(500).json({ error: error.message })
    }
}