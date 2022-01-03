import { Component, OnInit } from '@angular/core';
import * as go from 'gojs';
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from 'y-indexeddb';

@Component({
selector: 'app-teste',
templateUrl: './teste.component.html',
styleUrls: ['./teste.component.css']
})
export class TesteComponent implements OnInit {

    array: number[] = [];

    value: go.Diagram | undefined;

    ydoc = new Y.Doc();
   
    yarray:any;

    websocketProvider:any;

    textContent = "Disconnect"

    public state = {
        // Diagram state props
        diagramNodeData: [
            {key: 0, id: 'Alpha', text: "Alpha", color: 'lightblue'},
            {key: 1, id: 'Beta', text: "Beta", color: 'orange', 'parent': 0 },
            {key: 2, id: 'Gama', text: "Game", color: 'purple', 'parent': 0},
            {key: 3, id: 'Epslon', text: "Epslon", color: 'red', 'parent': 2 },
            {key: 4, id: 'Zeta', text: "Zeta", color: 'green',  'parent': 2}
        ],
        diagramModelData: { prop: 'value' },
        skipsDiagramUpdate: false,
        selectedNodeData: new go.Node()
    }; // end state object

    public diagramDivClassName: string = 'myDiagramDiv';
    public paletteDivClassName = 'myPaletteDiv';

    myDiagram :go.Diagram | undefined;
   
    constructor() { 
        const indexeddbProvider = new IndexeddbPersistence('TodoDoc', this.ydoc)

        // Getting contents of array from doc created.
        this.yarray = this.ydoc.getArray("TodoDoc");

        // Creating a websocket connection between users for a particular doc.
        this.websocketProvider = new WebsocketProvider(
        "wss://demos.yjs.dev",
        "TodoDoc",
        this.ydoc
        );
    }

    ngOnInit(): void {
    }

    helloWorld() {    
        console.log(this.myDiagram?.model.toJson());
    }

    public ngAfterViewInit() {
        this.initDiagram();
        this.demo();
    }

    initDiagram(): go.Diagram {
        const $ = go.GraphObject.make;
        
        this.myDiagram = $(go.Diagram, 'myDiagramDiv', 
        {
            'undoManager.isEnabled': false,
            maxSelectionCount: 1,
            validCycle: go.Diagram.CycleDestinationTree,
            layout: $(go.TreeLayout),
            "commandHandler.copiesTree": true,
            "commandHandler.copiesParentKey": true,
            model: $(go.GraphLinksModel,
                {
                    nodeKeyProperty: 'id',
                    linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
                }
            )
        });

        // definir menu de contexto
        let myContextMenu = $(go.HTMLInfo, {
            show: this.showContextMenu,
            hide: this.hideContextMenu
        });

        // define the Node template
        this.myDiagram.nodeTemplate =
            $(go.Node, 'Auto',
                { doubleClick: this.nodeDoubleClick },
                { contextMenu: myContextMenu },
                $(go.Shape, 'RoundedRectangle', { stroke: null },
                new go.Binding('fill', 'color')
                ),
                $(go.TextBlock, { margin: 8, editable: false },
                new go.Binding('text').makeTwoWay())
            );


        // define the Link template
        this.myDiagram.linkTemplate = $(go.Link,
            {routing: go.Link.Orthogonal, corner: 7},
            $(go.Shape, { strokeWidth: 3.5, stroke: "#5b5b5b" })
        );
        

        // Add nodes to diagram
        this.myDiagram.model = new go.TreeModel(this.state.diagramNodeData);
        this.myDiagram.contextMenu = myContextMenu;

        this.initEventDiagram();

        return this.myDiagram;
    }

    initEventDiagram() : void {
        //Versão de teste. Existem algumas boas praticas a serem consideradas. Olha projeto padrão do gojs para angular 11.
        this.initChangeSelection();
        this.initContextMenu();
        this.initCommandHandler();
    }

    initChangeSelection() {
        const testComponente = this;

        this.myDiagram?.addDiagramListener('ChangedSelection', function (event) {
            if (event.diagram.selection.count === 0) {
                testComponente.state.selectedNodeData = new go.Node();
            }

            const node = event.diagram.selection.first();

            if (node instanceof go.Node) {
                testComponente.state.selectedNodeData = node;
            }
        });
    }

    initContextMenu() {
        let cxElement = document.getElementById("contextMenu");

        cxElement?.addEventListener("contextmenu", function(e) {
            e.preventDefault();
            return false;
        }, false);
    }

    initCommandHandler() {
        const testComponente = this;
        
        this.myDiagram?.addDiagramListener('SelectionDeleting', function(e) {
            testComponente.deleteSelection(e.diagram);
        });

        this.myDiagram?.addDiagramListener('ClipboardPasted', function(e){
            console.log(e);
        });

    }

    copySelection(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.copySelection();
    }

    pasteSelection(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.pasteSelection();
    }

    deleteSelection(diagram: go.Diagram) {
        let node = this.state.selectedNodeData;

        if(node) {
            diagram?.startTransaction("reparent remove");
            let chl = node.findTreeChildrenNodes();
            let parent = node.findTreeParentNode();
            // iterate through the children and set their parent key to our selected node's parent key
            
                while (chl.next()) {
                  var emp = chl.value;

                  (diagram?.model as go.TreeModel).setParentKeyForNodeData(emp.data, parent? parent.data.key : '');
                }

                // and now remove the selected node itself
                diagram?.model.removeNodeData(node.data);
                diagram?.commitTransaction("reparent remove");
        }
    }

    cutSelection(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.cutSelection();
    }

    redu(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.pasteSelection();
    }

    undo(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.pasteSelection();
    }

    nodeDoubleClick(e: go.InputEvent, obj: any) {
         console.log(e);
         let diagram = e.diagram;
        var clicked = obj.part;
        
        if (clicked !== null) {
          let thisemp = clicked.data;
          diagram?.startTransaction("add employee");
          
          let newemp = {
            text: "Alpha", 
            color: "red",
            parent: thisemp.key
          };

          diagram?.model.addNodeData(newemp);
          diagram?.commitTransaction("add employee");
        }
    }

    public diagramModelChange = function(changes: go.IncrementalData) {
        // console.log(changes);
        // see gojs-angular-basic for an example model changed handler that preserves immutability
        // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
    };

    hideCX() {
        if (this.myDiagram?.currentTool instanceof go.ContextMenuTool) {
            this.myDiagram?.currentTool.doCancel();
        }
    }

    showContextMenu(obj : any, diagram : go.Diagram, tool : any) {
        // Show only the relevant buttons given the current state.
        var cmd = diagram.commandHandler;
        var hasMenuItem = false;
        
        function maybeShowItem(elt : any, pred : any) {
          if (pred) {
            elt.style.display = "block";
            hasMenuItem = true;
          } else {
            elt.style.display = "none";
          }
        }

        maybeShowItem(document.getElementById("cut"), cmd.canCutSelection());
        maybeShowItem(document.getElementById("copy"), cmd.canCopySelection());
        maybeShowItem(document.getElementById("paste"), cmd.canPasteSelection(diagram.toolManager.contextMenuTool.mouseDownPoint));
        maybeShowItem(document.getElementById("delete"), cmd.canDeleteSelection());
       
        // Now show the whole context menu element

        let cxElement = document.getElementById("contextMenu");

        if (hasMenuItem) {
          cxElement?.classList.add("show-menu");
          // we don't bother overriding positionContextMenu, we just do it here:
          var mousePt = diagram.lastInput.viewPoint;

          if(cxElement) {
              cxElement.style.left = mousePt.x + 5 + "px";
              cxElement.style.top = mousePt.y + "px";
          } 
        }
  
        // Optional: Use a `window` click listener with event capture to
        //           remove the context menu if the user clicks elsewhere on the page
        window.addEventListener("click", this.hideCX, true);
    }
  
    hideContextMenu() {
        let cxElement = document.getElementById("contextMenu");

        cxElement?.classList.remove("show-menu");
        // Optional: Use a `window` click listener with event capture to
        //           remove the context menu if the user clicks elsewhere on the page
        window.removeEventListener("click", this.hideCX, true);
    }

    cxcommand(event: any) {
        let val = event.currentTarget.id;
        let diagram = this.myDiagram;

        switch (val) {
          case "cut": diagram?.commandHandler.cutSelection(); break;
          case "copy": diagram?.commandHandler.copySelection(); break;
          case "paste": diagram?.commandHandler.pasteSelection(); break;
          case "delete": 
            if(diagram) {
                this.deleteSelection(diagram); break;   
            }

            break;
        }

        diagram?.currentTool.stopTool();
    }



    // RealTime websocket

    connect() {
        if (this.websocketProvider.shouldConnect) {
          this.websocketProvider.disconnect();
          this.textContent = "Connect";
        } else {
          this.websocketProvider.connect();
          this.textContent = "Disconnect";
        }
    }

    demo() {
        this.yarray.observe(() => {
          for (let i = 0; i < this.yarray.length; i++) {
            // console.log(this.yarray.get(i));
          }
        });
    
        this.ydoc.on("update", (update: Uint8Array) => {
          Y.applyUpdate(this.ydoc, update);
          
          let x = JSON.stringify(this.ydoc.getArray('TodoDoc').get(0));
          if(x) {
              let model = JSON.parse(x);
              if(this.myDiagram) {
                this.myDiagram.model = new go.TreeModel(model.nodes);
              }
          }
        });
    }

    insert() {
        if(this.myDiagram) {
            this.ydoc.getArray("TodoDoc").insert(0, [{nodes:this.myDiagram.model.nodeDataArray}]);
            this.ydoc.getArray("TodoDoc").get(0);
        }
      }

    remove() {
        this.ydoc.getArray("TodoDoc").delete(0);
    }
}
