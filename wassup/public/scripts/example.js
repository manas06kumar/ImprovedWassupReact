/* globals utils*/
/* eslint-disable no-unused-vars */
var data = [
    {id: 1, author: 'Pete Hunt', text: 'This is **one** comment'},
    {id: 2, author: 'Jordan Walke', text: 'This is *another* comment using __marked__'}
];

// tutorial1.js
var CommentBox = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    loadCommentsFromServer: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleCommentSubmit: function(comment) {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            type: 'POST',
            data: comment,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadCommentsFromServer();
        // setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },
    render: function () {
        return (
            <div className='commentBox'>
                <h1>Wassup</h1>
                <CommentList data={this.state.data}/>
                <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
            </div>
        );
    }
});

// tutorial2.js
var CommentList = React.createClass({
    render: function () {
        var commentNodes = this.props.data.map(function (comment, index) {
            return (
                <Comment author={comment.author} key={comment.id}>
                    {(index % 2 === 0) ? (`*${comment.text}*`) : comment.text}
                </Comment>
            );
        });
        return (
            <div className='commentList'>
              {commentNodes}
            </div>
        );
    }
});

var CommentForm = React.createClass({
    getInitialState: function() {
        return {author: '', text: ''};
    },
    handleAuthorChange: function(e) {
        console.log('author change');
        this.setState({author: e.target.value});
    },
    handleTextChange: function(e) {
        console.log('text change');
        this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var author = this.state.author.trim();
        var text = this.state.text.trim();
        if (!text ) {
            return;
        }
        this.props.onCommentSubmit({author: author, text: text});
        this.setState({author: '', text: ''});
    },
    render: function () {
        return (
            <form className='commentForm' onSubmit={this.handleSubmit}>
                <input
                    type='hidden'
                    placeholder='Your name'
                    value='{this.state.author}'
                    onChange={this.handleAuthorChange}
                />
                <input
                    type='text'
                    placeholder='Say something...'
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type='submit' value='Post' />
            </form>
        );
    }
});

// tutorial4.js
var Comment = React.createClass({
    render: function () {
        return (
            <div className='comment'>
                <h3 className='commentAuthor'>
                    {this.props.author}
                </h3>
                <div dangerouslySetInnerHTML={utils.rawMarkup(this.props.children.toString())} />
            </div>
        );
    }
});

ReactDOM.render(
    <CommentBox url='/api/comments' pollInterval={5000} />,
    document.getElementById('content')
);