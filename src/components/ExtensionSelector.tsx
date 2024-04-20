import React from 'react'
import axios from 'axios'

import './ExtensionSelector.scss'

interface ExtensionSelectorProps {
    setSelectedFormat: (format: string) => void
}

export default function ExtensionSelector({ setSelectedFormat }: ExtensionSelectorProps): React.ReactElement {
    const [formats, setFormats] = React.useState<string[]>([])

    React.useEffect(() => {
        const fetchFormats = async () => {
            const response = await axios.get<string[]>('http://localhost:3001/api/formats')
            setFormats(response.data)
        }

        fetchFormats()
    }, [])

    return (
        <select className='extension-selector' onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => setSelectedFormat(event.target.value)} defaultValue=''>
            <option value='' disabled>Select format</option>
            {formats.map((format: string): React.ReactElement => <option key={format} value={format}>{format.toUpperCase()}</option>)}
        </select>
    )
}