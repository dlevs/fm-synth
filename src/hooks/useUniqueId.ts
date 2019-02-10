import { useState } from 'react'

let uniqueIdCounter = 0

const useUniqueId = () => {
	const [id] = useState(`unique-id-input-${uniqueIdCounter++}`)

	return id
}

export default useUniqueId
