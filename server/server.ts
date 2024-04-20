import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import ytdl from 'ytdl-core'
import { promisify } from 'util'
import { pipeline, Readable } from 'stream'
import { readdirSync } from 'fs'
import { resolve } from 'path'

export interface HandlerProps {
    response: express.Response
    videoId: string
    streamPipeline: (stream: Readable, response: express.Response) => Promise<void>
}

class Server {
    protected streamPipeline: (stream: Readable, response: express.Response) => Promise<void>
    protected app: express.Application
    protected port: number

    constructor(port: number) {
        this.streamPipeline = promisify(pipeline)
        this.app = express()
        this.port = port

        this.configureMiddleware()
        this.configureRoutes()
        this.startServer()
    }

    protected configureMiddleware(): void {
        this.app.use(cors())
        this.app.use(helmet())
        this.app.use(morgan('tiny'))
        this.app.use((request: express.Request, response: express.Response, next: express.NextFunction): void => {
            void request
            response.setHeader('Connection', 'Keep-Alive') // Keep the connection alive
            response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // Disable caching
            response.setHeader('Pragma', 'no-cache') // Disable caching for HTTP/1.0
            response.setHeader('Expires', '0') // Disable caching for proxies
            response.setHeader('Access-Control-Expose-Headers', 'Content-Length') // Expose the Content-Length header
            next()
        })
    }

    protected configureRoutes(): void {
        this.app.get('/api/formats', async (request: express.Request, response: express.Response): Promise<void> => {
            void request
            const handlersFolder = resolve(__dirname, 'handlers')
            const handlersFiles = readdirSync(handlersFolder).filter(file => file.endsWith('.ts')).map(file => file.replace('.ts', ''))
            const formats = handlersFiles.filter(async (file: string): Promise<boolean> => {
                const handler = await import(`./handlers/${file}`)
                return handler.default instanceof Function
            })
            response.json(formats)
        })

        this.app.get('/api/validate', async (request: express.Request, response: express.Response): Promise<void> => {
            const { url } = request.query as { url: string }
            if (ytdl.validateURL(url)) {
                const videoInfo = await ytdl.getInfo(url)
                const videoId = videoInfo.videoDetails.videoId
                const videoTitle = videoInfo.videoDetails.title
                const videoThumbnail = videoInfo.videoDetails.thumbnails[videoInfo.videoDetails.thumbnails.length - 1]!.url
                response.json({ isValid: true, videoId, videoTitle, videoThumbnail })
            } else {
                response.status(400).json({ isValid: false })
            }
        })

        this.app.get('/api/download/:videoId/:format', async (request: express.Request, response: express.Response): Promise<void> => {
            const { videoId, format } = request.params as { videoId: string, format: string }
            const handler = await import(`./handlers/${format}`)
            const defaultHandler = handler.default as (props: HandlerProps) => Promise<void>
            if (defaultHandler)
                defaultHandler({ response, videoId, streamPipeline: this.streamPipeline })
            else
                response.status(404).json({ error: 'Handler not found' })
        })

        this.app.use((request: express.Request, response: express.Response): void => {
            void request
            response.status(404).json({ error: 'Route not found', availableRoutes: ['/api/formats', '/api/validate', '/api/download/:videoId/:format'] })
        })
    }

    protected startServer(): void {
        const server = this.app.listen(this.port, () => {
            console.clear()
            console.log(`Server is listening on http://localhost:${this.port}`)
        })
        server.setTimeout(0)
        server.setMaxListeners(0)
    }
}

new Server(3001)