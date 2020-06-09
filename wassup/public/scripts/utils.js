var utils = {
    rawMarkup: function (htmlStr){
        var rawMarkup = marked(htmlStr, {sanitize: true});
        return { __html: rawMarkup };
    }
};