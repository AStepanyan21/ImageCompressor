import { useEffect, useState } from 'react'

/** Creates an object URL for a local file and revokes it when the file changes or the component unmounts. */
export function useObjectUrl(file: File | null): string | null {
  const [entry, setEntry] = useState<{ file: File; url: string } | null>(null)

  useEffect(() => {
    if (!file) return
    // Object URLs are an external resource: they must be created and revoked in an effect
    // (StrictMode re-runs effects, so creating them during render would leak or revoke a URL in use).
    const url = URL.createObjectURL(file)
    // oxlint-disable-next-line react/set-state-in-effect
    setEntry({ file, url })
    return () => URL.revokeObjectURL(url)
  }, [file])

  // Ignore a stale URL left over from a previous file.
  return file && entry?.file === file ? entry.url : null
}
