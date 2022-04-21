export function useUpdatePlaylist(key, obj, cb = () => null) {
	
	if (window.db && key) {
		
		const store = window.db.transaction(['playlist'], "readwrite").objectStore('playlist'),
		req = store.get(key);

		req.onerror = (e) => {
			console.log('Error!!', e)
		}

		req.onsuccess = e => {
			const itm = e.target.result;

			if (itm) {
				itm.urls.push(obj)
				store.put(itm)
				cb(true)
			}
		}

	} else alert('No indexedDB Created')

}

export function useCreatePlaylist(key, obj, cb = () => null ) {
	if (window.db && key && obj) {
		
		const store = window.db.transaction(['playlist'], "readwrite").objectStore('playlist'),
		req = store.get(key);

		req.onerror = (e) => {
			console.log('Error!!', e)
		}

		req.onsuccess = (e) => {
			const res = e.target.result;

			if (!res) {

				store.add({
					name: key, urls: obj
				});

				cb(res);

			} else {
				console.log(e.target.result);
				alert(`Error: Playlist with name ${key} exists`)
			}

		}
	} else alert('No indexedDB Created')
}

export function useGetPlaylist(key, cb = () => null ) {

	if (window.db && key) {
		
		const store = window.db.transaction(['playlist']).objectStore('playlist'),
		req = store.get(key);

		req.onerror = (e) => {
			console.log('Error!!', e)
		}

		req.onsuccess = e => {
			const res = e.target.result;

			if (res) {
				cb(res)
			}
		}

	} else alert('No indexedDB Created')
}

export function useListPlaylists(cb = () => null) {
	if (window.db) {

		let pls = [];

		const store = window.db.transaction(['playlist']).objectStore('playlist'),
		cursor = store.openCursor();

		cursor.onsuccess = (e) => {
			const pl = e.target.result;

			if (pl) {
				pls.push(pl.value)
				pl.continue()
			} else {
				cb(pls)
			}

		}
	}
}