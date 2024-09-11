import React, { useRef, useEffect } from 'react';
import * as go from 'gojs';
import { saveAs } from 'file-saver';

function DiagramComponent() {
  const diagramRef = useRef(null);

  const initDiagram = () => {
    const $ = go.GraphObject.make;

    const myDiagram = $(go.Diagram, diagramRef.current, {
      'undoManager.isEnabled': true,
      model: $(go.GraphLinksModel, {
        linkFromPortIdProperty: "fromPort",
        linkToPortIdProperty: "toPort",
      }),
      ModelChanged: () => { },
      validCycle: go.CycleMode.All,
      "linkingTool.linkValidation": checkLink,
      "relinkingTool.linkValidation": checkLink,
      "LinkDrawn": (e) => { enforceSingleLinkPerPort(e.subject); },
      "LinkRelinked": (e) => { enforceSingleLinkPerPort(e.subject); },
    });

    function addUserOption(e, obj) {
      const node = obj.part;
      const diagram = node.diagram;
      diagram.startTransaction("add option");
      const data = node.data;
      const itemArray = data.fields || [];
      const menuID = "MI" + (itemArray.length + 1);
      const newMenuItem = { menuID: menuID, menuItem: "New option" };
      diagram.model.insertArrayItem(itemArray, -1, newMenuItem);
      diagram.commitTransaction("add option");
    }

    function deleteUserOption(e, obj) {
      const itemPanel = obj.panel.panel;
      const userOption = itemPanel.data;
      const node = itemPanel.part;
      if (node instanceof go.Node) {
        const diagram = node.diagram;
        diagram.startTransaction("delete option");
        const itemArray = node.data.fields;
        const itemIndex = itemArray.indexOf(userOption);
        if (itemIndex >= 0) diagram.model.removeArrayItem(itemArray, itemIndex);
        diagram.commitTransaction("delete option");
      }
    }

    function checkLink(fromNode, fromPort, toNode, toPort, link) {
      if (!fromPort || !toPort) return false;

      // Ensure not more than one link from the same port
      if (fromPort.linksConnected && fromPort.linksConnected.count > 0) {
        return fromPort.linksConnected.contains(link);
      }

      return true;
    }

    function enforceSingleLinkPerPort(link) {
      const fromPort = link?.fromPort;
      if (!fromPort) return;

      const links = fromPort.linksConnected;
      if (links && links.count > 1) {
        // If more than one link is connected to a port, remove the additional links
        while (links.count > 1) {
          const extraLink = links.first(function (l) { return l !== link; });
          link.diagram.remove(extraLink);
        }
      }
    }

    const fieldTemplate = $(go.Panel, "TableRow", {
      background: "transparent",
      fromSpot: go.Spot.Right,
      toSpot: go.Spot.Left,
      fromLinkable: true,
      toLinkable: false,
      margin: new go.Margin(2, 0),
      alignment: go.Spot.Right,
      alignmentFocus: go.Spot.Right
    }).add(
      $(go.Panel, "Horizontal", {
        name: "USER_OPTION",
        background: "transparent",
        cursor: "pointer",
        alignment: go.Spot.Right,
        alignmentFocus: go.Spot.Right,
        stretch: go.GraphObject.Fill
      },
        $(go.Panel, { width: 14 }),
        $(go.TextBlock, {
          margin: new go.Margin(0, 5),
          font: '13px sans-serif',
          editable: true,
          isMultiline: false,
          textAlign: "right",
          width: 100
        }, new go.Binding("text", "menuItem").makeTwoWay()),
        $(go.Shape, {
          width: 12,
          height: 12,
          fill: "#00BCF2",
          strokeWidth: 2,
          fromLinkable: true,
          toLinkable: false,
          alignment: go.Spot.Right,
          margin: new go.Margin(0, 0, 0, 5),
        }, new go.Binding("portId", "menuID"))
      ),
      $(go.Shape, {
        name: "DELETE_BUTTON",
        figure: "XLine",
        desiredSize: new go.Size(8, 8),
        stroke: "red",
        strokeWidth: 2,
        alignment: go.Spot.Left,
        margin: new go.Margin(0, -12, 0, 5),
        visible: false,
        click: deleteUserOption
      })
    );

    myDiagram.nodeTemplate = $(go.Node, "Auto", {
      copyable: true,
      deletable: true,
      resizable: true,
      resizeObjectName: "PANEL",
    },
      $(go.Shape, { fill: "#EEEEEE" }),
      $(go.Panel, "Vertical", { name: "PANEL", minSize: new go.Size(100, 60) },
        $(go.Panel, "Auto", { stretch: go.Stretch.Horizontal },
          $(go.Shape, { fill: "#1570A6", stroke: null }),
          $(go.TextBlock, {
            alignment: go.Spot.Center,
            margin: new go.Margin(5, 5, 5, 20),
            stroke: "white",
            textAlign: "center",
            font: "bold 12pt sans-serif",
            editable: true
          }, new go.Binding("text", "key").makeTwoWay())
        ),
        $(go.Panel, "Auto", { stretch: go.Stretch.Horizontal, toLinkable: false },
          $(go.Shape, { fill: '#00BCF2', stroke: null }),
          $(go.TextBlock, {
            alignment: go.Spot.Left,
            margin: new go.Margin(5, 5, 5, 20),
            stroke: "black",
            textAlign: "left",
            font: "italic 12pt sans-serif",
            editable: true,
            wrap: go.TextBlock.WrapFit
          }, new go.Binding("text", "agent").makeTwoWay())
        ),
        $(go.Panel, "Table", {
          padding: new go.Margin(5, 5, 5, 15),
          minSize: new go.Size(100, 10),
          defaultStretch: go.Stretch.Horizontal,
          itemTemplate: fieldTemplate
        }, new go.Binding("itemArray", "fields")),
        $(go.Panel, "Horizontal", {
          alignment: go.Spot.Right,
          alignmentFocus: go.Spot.Right,
          margin: new go.Margin(5, 0, 0, 0)
        },
          $("Button", { click: addUserOption },
            $(go.TextBlock, "Add Option")
          ))
      ),
      $(go.Shape, {
        width: 6,
        height: 6,
        fill: "green",
        margin: new go.Margin(4, 4, 4, 0),
        portId: "L",
        fromLinkable: true,
        toLinkable: true,
        fromSpot: go.Spot.Left,
        toSpot: go.Spot.Left,
        alignment: go.Spot.Left
      })
    );

    myDiagram.linkTemplate = $(go.Link, {
      relinkableFrom: true,
      relinkableTo: true,
      toShortLength: 4,
      fromShortLength: 2,
      routing: go.Link.AvoidsNodes,
      curve: go.Link.JumpOver,
    },
      $(go.Shape, { strokeWidth: 1.5 }),
      $(go.Shape, { toArrow: "Standard", stroke: null })
    );

    myDiagram.model = $(go.GraphLinksModel, {
      linkFromPortIdProperty: "fromPort",
      linkToPortIdProperty: "toPort",
      nodeDataArray: [
        {
          key: "STATE1",
          agent: "Hi Bob, how are you?",
          fields: [
            { menuID: "MI1", menuItem: "Fine thanks." },
            { menuID: "MI2", menuItem: "Could be better." }
          ],
          loc: "0 0"
        },
        { key: "STATE2", agent: "Terrific.", fields: [], loc: "280 0" },
        { key: "STATE3", agent: "Sorry to hear.", fields: [], loc: "280 80" }
      ],
      linkDataArray: [
        { from: "STATE1", fromPort: "MI1", to: "STATE2", toPort: "L" },
        { from: "STATE1", fromPort: "MI2", to: "STATE3", toPort: "L" }
      ]
    });

    // assign to window for global access
    window.myDiagram = myDiagram;

    return myDiagram;
  };

  useEffect(() => {
    const myDiagram = initDiagram();
    return () => { myDiagram.div = null; };
  }, []);

  return (
    <div ref={diagramRef} style={{ border: '1px solid black', width: '100%', height: '500px' }}></div>
  );
}

export default DiagramComponent;