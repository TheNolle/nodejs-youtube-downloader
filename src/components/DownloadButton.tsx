import React from 'react'
import axios, { AxiosProgressEvent } from 'axios'
import { toast } from 'react-toastify'

import './DownloadButton.scss'

interface DownloadButtonProps {
    videoTitle: string
    videoId: string
    format: string
}

export default function DownloadButton({ videoTitle, videoId, format }: DownloadButtonProps): React.ReactElement {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [downloadProgress, setDownloadProgress] = React.useState<number>(0)

    const handleDownload = React.useCallback(async () => {
        if (!videoId || !format || downloadProgress > 0 || loading) return
        toast.clearWaitingQueue()
        toast.info(`Trying to download ${videoTitle}.${format}... Please wait...`)
        setLoading(true)
        setDownloadProgress(0)
        axios({
            method: 'GET',
            url: `http://localhost:3001/api/download/${videoId}/${format}`,
            timeout: 0,
            responseType: 'blob',
            onDownloadProgress: (progressEvent: AxiosProgressEvent) => {
                const totalLength = progressEvent.total
                if (totalLength) {
                    if (isNaN(totalLength))
                        console.warn('Received NaN for content length, ignoring...')
                    else {
                        const percentCompleted = (progressEvent.loaded * 100) / totalLength
                        setDownloadProgress(percentCompleted)
                    }
                }
            }
        })
            .then((response: any): void => {
                toast.clearWaitingQueue()
                if (!response) {
                    setLoading(false)
                    setDownloadProgress(0)
                    toast.error('An error occurred while downloading the file. Please try again.')
                    return
                }
                const url = window.URL.createObjectURL(new Blob([response.data]))
                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `${videoTitle}.${format}`)
                document.body.appendChild(link)
                link.click()
                link.remove()
                window.URL.revokeObjectURL(url)
                setLoading(false)
                setDownloadProgress(0)
                toast.success(`File downloaded successfully:  ${videoTitle}.${format}`)
            })
            .catch((error: any): void => {
                setLoading(false)
                setDownloadProgress(0)
                toast.clearWaitingQueue()
                toast.error('An error occurred while downloading the file. Please try again. Check the console for more details.')
                console.error(`[${new Date().toLocaleString()}]`, error)
            })
    }, [videoTitle, videoId, format])

    return (
        <button className='download-button'
            disabled={!videoId || !format || loading}
            onClick={handleDownload}
            style={{ backgroundSize: `${downloadProgress}% 100%` }}
        >
            {loading || downloadProgress > 0 ? `Downloading... ${downloadProgress.toFixed(2)}%` : 'Download'}
        </button>
    )
}