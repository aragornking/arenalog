$(document).ready(function()
{
    var canvas = $("#arena-player");
    var context = canvas.get(0).getContext('2d');
    var container = $(canvas).parent();

    $(window).resize(resize_canvas);

    function resize_canvas()
    {
        canvas.attr('width', $(container).width());
        canvas.attr('height', $(container).height());
        display();
    }

    function get_url_parameter(name)
    {
        return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]);
    }

    function display()
    {
        var id = get_url_parameter('id');
        var data_url = 'data/' + id + '.json';

        $.getJSON(data_url, function ( data )
        {
            console.log("JSON DATA : " + data);
        });

        context.fillStyle = "blue";
        context.font = "bold 16px Arial";
        context.fillText(id, 100, 100);
    }

    // init
    resize_canvas();
    display();
});

