function extract_data(content) {

                const data_list = content.trimEnd().split('\r\n')
                const data = new Object();
                for (var x = 0; x < data_list[0].split(',').length; x++) {
                    var temp_list = [];
                    for (var y = 1; y < data_list.length; y++) {
                        temp_list.push(data_list[y].split(',')[x]);
                    }
                    data[data_list[0].split(',')[x]] = temp_list;
                }
                console.log(data);
                return data;
        };
        var hme_data = 0
        var hhe_data = 0
        document.getElementById('hme').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    hme_data = extract_data(content);
                };
                reader.readAsText(file);
            }
        });
        document.getElementById('hhe').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    hhe_data = extract_data(content);
                };
                reader.readAsText(file);
            }
        });
        document.getElementById('drawGraph').addEventListener('click', function(){
            const cy = cytoscape({
                container: document.getElementById('cy'),
                elements: [
                ],
                layout: {
                    name: 'breadthfirst',
                    directed: true,
                    padding: 10,
                    spacingFactor: 1.5,
                    animate: false,
                },
                style: [
                    {
                        selector: 'node',
                        style: {
                            'shape': 'rectangle',
                            'label': 'data(id)',
                            'text-valign': 'center',
                            'text-halign': 'center',
                            'color': '#000',
                            'background-color': '#6FB1FC',
                            'width': 'label',
                            'font-size': '20px',
                            'height': 'label',
                            'padding': '10px'
                        }
                    },
                    {
                        selector: 'edge[type = "I"]',
                        style: {
                            'line-color': 'red',
                            'target-arrow-color': 'red'
                        }
                    },
                    {
                        selector: 'edge[type = "A"]',
                        style: {
                            'line-color': 'blue',
                            'target-arrow-color': 'blue'
                        }
                    },
                    {
                        selector: 'node[layer = 1]',
                        style: {
                            'background-color': '#ADD8E6' // Light blue for layer 1
                        }
                    },
                    {
                        selector: 'node[layer = 2]',
                        style: {
                            'background-color': '#90EE90' // Light green for layer 2
                        }
                    },
                    {
                        selector: 'node[layer = 3]',
                        style: {
                            'background-color': '#FFD700' // Gold for layer 3
                        }
                    },
                    {
                        selector: 'node[layer = 4]',
                        style: {
                            'background-color': '#FFA07A' // Light salmon for layer 4
                        }
                    }
                ],
                userZoomingEnabled: false
            });
            var level1 = [];
            var level2 = [];
            var level3 = [];
            var level4 = [];
            var edges12 = [];
            var edges23 = [];
            var edges34 = [];
            hme_l1_unique = [...new Set(hme_data['Microbe Sp.'])];
            hme_l2_unique = [...new Set(hme_data['Node-Microbe'])];
            hme_l3_unique = [...new Set(hme_data['Node1-Host'])];
            hhe_l4_unique = [...new Set(hhe_data['Node2-Host'])];

            for (var i = 0; i < hme_l1_unique.length; i++) {
                level1.push({data: {
                    id: hme_l1_unique[i],
                    layer: 1
                }});
            }
            for (var i = 0; i < hme_l2_unique.length; i++) {
                level2.push({data: {
                    id: hme_l2_unique[i],
                    layer: 2
                }});
            }
            for (var i = 0; i < hme_l3_unique.length; i++) {
                if (!hhe_l4_unique.includes(hme_l3_unique[i])) {
                    level3.push({data: {
                        id: hme_l3_unique[i],
                        layer: 3
                    }});
                }
            }
            for (var i = 0; i < hhe_l4_unique.length; i++) {
                level4.push({data: {
                    id: hhe_l4_unique[i],
                    layer: 4
                }})
            }
            for (var i = 0; i < hme_data['Microbe Sp.'].length; i++) {
                edges12.push({data: {
                    id: '12_edge' + i,
                    source: hme_data['Microbe Sp.'][i],
                    target: hme_data['Node-Microbe'][i]
                }});
            }
            for (var i = 0; i < hme_data['Node-Microbe'].length; i++) {
                edges23.push({data: {
                    id: '23_edge' + i,
                    source: hme_data['Node-Microbe'][i],
                    target: hme_data['Node1-Host'][i],
                    type: hme_data['type of interaction'][i]
                }});
            }
            for (var i = 0; i < hhe_data['Node1-Host'].length; i++) {
                edges34.push({data: {
                    id: '34_edge' + i,
                    source: hhe_data['Node1-Host'][i],
                    target: hhe_data['Node2-Host'][i],
                    type: hhe_data['type of interaction'][i]
                }})
            }
            console.log(level3)
            console.log(level4);
            console.log(edges34);
            console.log(cy)
            cy.add(level1);
            cy.add(level2);
            cy.add(level3);
            cy.add(level4);
            cy.add(edges12);
            cy.add(edges23);
            cy.add(edges34);
            cy.layout({
                name: 'breadthfirst',
                directed: true,
                padding: 10,
                spacingFactor: 1,
                animate: false,
                direction: 'downward',
                roots: cy.nodes().filter(n => n.data('layer') === 1),
                sort: (a, b) => a.data('layer') - b.data('layer')
            }).run();

            document.getElementById('download').addEventListener('click', function(){
                const svgContent = cy.svg({ scale: 1, full: true });

                const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "graph.svg";
                a.click();

                URL.revokeObjectURL(url);
            });

        });
