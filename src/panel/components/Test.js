import React, {PropTypes} from 'react';
import {injectIntl, intlShape} from 'react-intl';
import renderIf from 'render-if';
import classNames from 'classnames';
import {noop} from 'lodash';
import Icon from './Icon';
import TestInstructions from './TestInstructions';
import TestHelpersContainer from './TestHelpersContainer';



/**
 *
 */
function Test({
        id, title, instructions, importResult, applicable, applied,
        areInstructionsOpen, toggleInstructions,
        done, comment, onApply, onDone, onCommentChange, intl
}) {
        const handleApplyChange = (event) => {
                onApply(event.target.checked);
                if (event.target.checked) {
                        toggleInstructions(true);
                }
        };

        const handleDoneChange = (event) =>
                onDone(event.target.checked);

        const handleCommentChange = (event) =>
                onCommentChange(event.target.value);

        const applyTranslateKey = applied ? 'uncheck' : 'check';
        const className = classNames({
                Test: true,
                'is-applied': applied
        });
        const commentInputId = `test-${id}-comment-input`;
        const commentHintId = `test-${id}-comment-hint`;

        return (
                <article className={className}>
			<header className="Test-header">
				<div className="Test-title">
					<h4 className="Test-id">
						{intl.formatMessage({id: 'Test.title'}, {id})}
					</h4>
					<div
						className="Test-description"
						dangerouslySetInnerHTML={{
							__html: title
						}}
					/>
				</div>

				<div className="Test-actions">
					{renderIf(importResult)(() => (
						<div className="Test-action Test-action---import">
							<span
								className="Label ImportResult"
								data-import-result={importResult}
								title={intl.formatMessage({
									id: `ImportResult.${importResult}.title`
								})}
							>
								{importResult}
							</span>
						</div>
					))}

					{renderIf(applicable)(() => (
						<div className="Test-action Test-action---apply">
							<input
								title={intl.formatMessage({
									id: `Test.apply.${applyTranslateKey}.title`
								}, {id})}
								className="Test-actionInput"
								type="checkbox"
								id={`test-${id}-apply-input`}
								checked={applied}
								onChange={handleApplyChange}
							/>
						</div>
					))}

					<div
						className={classNames('Test-action Test-action--done', {
							'Test-action--checked': done
						})}
					>
						<label
							htmlFor={`test-${id}-done-input`}
							className="Test-actionLabel"
							title={intl.formatMessage({
								id: done ? 'Test.done' : 'Test.todo'
							})}
						>
							<Icon name="flag" />
						</label>
						<input
							className="Test-actionInput u-hidden"
							type="checkbox"
							id={`test-${id}-done-input`}
							checked={done}
							onChange={handleDoneChange}
						/>
					</div>
				</div>
			</header>

			{renderIf(instructions)(() => (
				<TestInstructions
					id={id}
					instructions={instructions}
					isOpen={areInstructionsOpen}
					onToggleRequest={toggleInstructions}
				/>
			))}

                        {renderIf(applied)(() => (
                                <TestHelpersContainer id={id} />
                        ))}

                        <div className="Test-comment">
                                <label className="Test-commentLabel" htmlFor={commentInputId}>
                                        {intl.formatMessage({id: 'Test.comment.label'})}
                                </label>
                                <textarea
                                        id={commentInputId}
                                        className="Test-commentTextarea"
                                        value={comment}
                                        maxLength={500}
                                        placeholder={intl.formatMessage({id: 'Test.comment.placeholder'})}
                                        aria-describedby={commentHintId}
                                        onChange={handleCommentChange}
                                        rows={4}
                                />
                                <p className="Test-commentHint" id={commentHintId}>
                                        {intl.formatMessage({id: 'Test.comment.help'}, {max: 500})}
                                </p>
                        </div>
                </article>
        );
}

Test.propTypes = {
	id: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	instructions: PropTypes.string,
	importResult: PropTypes.string,
        applicable: PropTypes.bool,
        applied: PropTypes.bool,
        done: PropTypes.bool,
        comment: PropTypes.string,
        onApply: PropTypes.func,
        onDone: PropTypes.func,
        onCommentChange: PropTypes.func,
        intl: intlShape.isRequired,
        areInstructionsOpen: PropTypes.bool,
        toggleInstructions: PropTypes.func
};

Test.defaultProps = {
        applicable: false,
        applied: false,
        done: false,
        comment: '',
        importResult: '',
        onApply: noop,
        onDone: noop,
        onCommentChange: noop
};

export default injectIntl(Test);
