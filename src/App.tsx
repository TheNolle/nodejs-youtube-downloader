import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'

import './App.scss'

import VideoInput from './components/VideoInput'
import ExtensionSelector from './components/ExtensionSelector'
import DownloadButton from './components/DownloadButton'

export default function App(): React.ReactElement {
    const [videoData, setVideoData] = React.useState<{ videoId: string, videoTitle: string, videoThumbnail: string } | null>(null)
    const [selectedFormat, setSelectedFormat] = React.useState<string>('')

    React.useEffect(() => {
        document.title = 'Youtube Downloader'
    }, [])

    return (
        <>
            <h1>Youtube Downloader</h1>

            <h2>Enter video URL</h2>
            <VideoInput setVideoData={setVideoData} />

            {videoData && videoData.videoId && videoData.videoTitle && videoData.videoThumbnail && <>
                <h2>{videoData.videoTitle}</h2>
                <img src={videoData.videoThumbnail} alt={videoData.videoTitle} />
            </>}

            {videoData && videoData.videoId && videoData.videoTitle && videoData.videoThumbnail && <>
                <h2>Choose format</h2>
                <ExtensionSelector setSelectedFormat={setSelectedFormat} />
            </>}

            {videoData && videoData.videoId && videoData.videoTitle && videoData.videoThumbnail && selectedFormat && <DownloadButton videoTitle={videoData.videoTitle} videoId={videoData.videoId} format={selectedFormat} />}

            <ToastContainer position="bottom-right" closeOnClick theme="dark" />
        </>
    )
}