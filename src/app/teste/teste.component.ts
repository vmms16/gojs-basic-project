import { Component, OnInit } from '@angular/core';
import * as go from 'gojs';

@Component({
selector: 'app-teste',
templateUrl: './teste.component.html',
styleUrls: ['./teste.component.css']
})
export class TesteComponent implements OnInit {


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
   
    constructor() { }

    ngOnInit(): void {
    }

    helloWorld() {    
        console.log(this.myDiagram?.model.toJson());
    }

    public ngAfterViewInit() {
        this.initDiagram();
    }

    initDiagram(): go.Diagram {
        const $ = go.GraphObject.make;
        
        this.myDiagram = $(go.Diagram, 'myDiagramDiv', 
        {
            'undoManager.isEnabled': false,
            maxSelectionCount: 1,
            validCycle: go.Diagram.CycleDestinationTree,
            layout: $(go.TreeLayout),
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
        let cmdhnd = this.myDiagram?.commandHandler;
        
        cmdhnd?.canCopySelection();
        cmdhnd?.canPasteSelection();
        cmdhnd?.canCutSelection();
        cmdhnd?.canDeleteSelection();
        cmdhnd?.canUndo();
        cmdhnd?.canRedo();
    }

    copySelection(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.copySelection();
    }

    pasteSelection(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.pasteSelection();
    }

    deleteSelection(myDiagram: go.Diagram) {
        myDiagram?.commandHandler.deleteSelection();
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
        maybeShowItem(document.getElementById("color"), obj !== null);
  
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
}
