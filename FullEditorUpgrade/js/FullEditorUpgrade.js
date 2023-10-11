tinymce.PluginManager.add('am_add_button10_CP', function (editor, url) {
    // Add a button that opens a window
    editor.addButton('am_add_button10_CP', {
        text: 'am_add_button10_CP',
        icon: false,
        onclick: function () {
            var content = tinymce.activeEditor.getContent();
            var btn = document.createElement("button");
            editor.insertContent('<br><button class="test_cls" >hello world</button><br>');
            btn.className = "test_cls";
            btn.value = "from js";
            document.appendChild(btn);

        }
    });

    // Adds a menu item to the tools menu
    editor.addMenuItem('am_add_button10_CP', {
        text: 'AddButton4',
        context: 'tools',
        onclick: function () {
            var btn = document.createElement("button");
            editor.insertContent('<br><button class="test_cls" >hello world</button><br>');
            editor.insertContent('<br><button style="background-color: red;">hello world2</button><br>');
            debugger;
            btn.className = "test_cls";
            btn.value = "from js";

            $("#breadcrumbs").html("<textarea>THIS IS INSERTED FROM Tiny MCE</textarea>")
        }
    });

    editor.addMenuItem('am_add_button10_CP', {
        text: 'AddButton5',
        context: 'tools',
        onclick: function () {


            $("#breadcrumbs").html("<textarea>THIS IS INSERTED FROM Tiny MCE</textarea>")
        }
    });

    return {
        getMetadata: function () {
            return {
                name: "am_add_button10_CP"
            };
        }
    };
});
tinymce.init({
    selector: 'textarea',
    plugins: 'am_add_button10_CP',
    toolbar: 'am_add_button10_CP'
});