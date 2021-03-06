import React from 'react';
import { models } from 'snoode';

import CommentReplyForm from './comment/CommentReplyForm';
import SortSelector from './SortSelector';
import extractErrorMsg from '../../lib/extractErrorMsg';
import { SORTS } from '../../sortValues';

const T = React.PropTypes;

export default class LinkTools extends React.Component {
  static propTypes = {
    app: T.object.isRequired,
    apiOptions: T.object.isRequired,
    linkId: T.string.isRequired,
    onNewComment: T.func,
    onSortChange: T.func,
    token: T.string,
    isLocked: T.bool,
    sort: T.string,
  };

  static defaultProps = {
    onNewComment: () => {},
    onSortChange: () => {},
    isLocked: false,
    sort: SORTS.CONFIDENCE,
  };

  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
      commentValue: '',
      error: '',
    };

    this.toggleForm = this.toggleForm.bind(this);
    this.submitNewComment = this.submitNewComment.bind(this);
    this.handleFormChange = this.handleFormChange.bind(this);
  }

  toggleForm() {
    if (this.props.isLocked) { return; }
    if (this.props.app.needsToLogInUser()) { return; }

    this.setState({
      showForm: !this.state.showForm,
    });
  }

  handleFormChange(value) {
    this.setState({
      commentValue: value,
    });
  }

  async submitNewComment() {
    if (this.props.app.needsToLogInUser()) { return; }

    try {
      const options = {
        ...this.props.app.api.buildOptions(this.props.apiOptions),
        model: new models.Comment({
          thingId: this.props.linkId,
          text: this.state.commentValue.trim(),
        }),
      };

      const newComment = await this.props.app.api.comments.post(options);

      this.setState({
        showForm: false,
        commentValue: '',
        error: '',
      });

      this.props.onNewComment(newComment);
    } catch (e) {
      this.setState({
        error: extractErrorMsg(e),
      });
    }
  }

  render() {
    const { showForm } = this.state;

    return (
      <div className='LinkTools'>
        { showForm ? this.renderForm() : this.renderTools() }
      </div>
    );
  }

  renderForm() {
    const { commentValue, error } = this.state;

    return (
      <CommentReplyForm
        onClose={ this.toggleForm }
        onContentChange={ this.handleFormChange }
        onReplySubmit={ this.submitNewComment }
        buttonText='ADD COMMENT'
        value={ commentValue }
        error={ error }
      />
    );
  }

  renderTools() {
    const { isLocked } = this.props;

    return (
      <div className='LinkTools__tools'>
        { this.renderSort() }
        <div
          className='LinkTools__comment'
          onClick={ this.toggleForm }
        >
          { isLocked ? 'Comments are locked' : 'Write a comment' }
        </div>
      </div>
    );
  }

  renderSort() {
    const { sort, app } = this.props;

    return (
      <div className='LinkTools__sort'>
        <SortSelector
          app={ app }
          sortValue={ sort }
          sortOptions={ [
            SORTS.CONFIDENCE,
            SORTS.TOP,
            SORTS.NEW,
            SORTS.CONTROVERSIAL,
            SORTS.QA,
          ] }
          onSortChange={ this.props.onSortChange }
          title='Sort comments by:'
        />
      </div>
    );
  }
}
