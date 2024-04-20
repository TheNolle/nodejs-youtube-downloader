import React from 'react'
import axios from 'axios'

import './VideoInput.scss'

interface VideoInputProps {
    setVideoData: ({ videoId, videoTitle, videoThumbnail }: { videoId: string, videoTitle: string, videoThumbnail: string }) => void
}

export default function VideoInput({ setVideoData }: VideoInputProps): React.ReactElement {
    const [url, setUrl] = React.useState<string>('')
    const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null)

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const videoUrl = event.target.value.trim()
        setUrl(videoUrl)

        if (timer)
            clearTimeout(timer)

        const newTimer = setTimeout(async () => {
            if (videoUrl) {
                axios.get(`http://localhost:3001/api/validate?url=${encodeURIComponent(videoUrl)}`)
                    .then((response: any): void => {
                        if (response.data.isValid)
                            setVideoData(response.data)
                        else
                            setVideoData({ videoId: '', videoTitle: '', videoThumbnail: '' })
                    })
                    .catch((error: Error): void => console.error(`Error validating video URL: ${error.message}`))
            }
            setVideoData({ videoId: '', videoTitle: '', videoThumbnail: '' })
        }, 500)

        setTimer(newTimer)
    }

    const handleRightClick = (event: React.MouseEvent<HTMLInputElement>): void => {
        event.preventDefault()
        setUrl('')
        setVideoData({ videoId: '', videoTitle: '', videoThumbnail: '' })
    }

    return (
        <input type="url" className="videoInput" value={url} onChange={handleUrlChange} onContextMenu={handleRightClick} placeholder="Enter Youtube URL" />
    )
}