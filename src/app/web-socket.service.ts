import { Injectable } from '@angular/core';
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from 'y-indexeddb';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  providers = new Map();
  ydoc = new Y.Doc();
  yarray = new Map();

  constructor() { }

  createConnection(id: string) {
    const indexeddbProvider = new IndexeddbPersistence(id, this.ydoc)
        // Getting contents of array from doc created.
        this.yarray.set(id, this.ydoc.getArray(id))

        // Creating a websocket connection between users for a particular doc.
        this.providers.set(id, new WebsocketProvider(
            "wss://demos.yjs.dev",
            id,
            this.ydoc
          )
        );
  }

//   connect(id: string) {
//     if (this.providers.get(id).shouldConnect) {
//       return this.websocketProvider.disconnect();
//     } else {
//       return this.websocketProvider.connect();
//     }
// }
}
