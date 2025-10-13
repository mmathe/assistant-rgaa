import {collectTargets, buildPrompt, MAX_HTML_SNIPPET_LENGTH} from './aiAnalysis';

describe('common/sagas/aiAnalysis helpers', function() {
        describe('collectTargets', function() {
                it('should normalise selectors and sanitise HTML snippets', function() {
                        const longHtml = `<div>${'a'.repeat(MAX_HTML_SNIPPET_LENGTH + 100)}</div>`;
                        const helpers = [
                                {
                                        selector: 'img.logo, img.hero',
                                        outerHtml: '<img src="logo.png" style="color:red" onclick="alert(1)" alt="Logo" />',
                                        xpath: '//img[1]'
                                },
                                {
                                        targets: [
                                                {
                                                        selector: '.cta-button',
                                                        outerHtml: longHtml,
                                                        screenshotRef: 'screen-1'
                                                }
                                        ]
                                }
                        ];

                        const targets = collectTargets(helpers);

                        expect(targets).to.have.length(3);
                        expect(targets[0]).to.deep.include({selector: 'img.logo'});
                        expect(targets[0].outerHtml).to.not.include('onclick');
                        expect(targets[0].outerHtml).to.not.include('style=');
                        expect(targets[0].xpath).to.equal('//img[1]');

                        const snippet = targets[2].outerHtml;
                        expect(snippet.length).to.be.at.most(MAX_HTML_SNIPPET_LENGTH);
                        expect(targets[2].screenshotRef).to.equal('screen-1');
                });
        });

        describe('buildPrompt', function() {
                it('should include rules, targets and JSON instructions in the prompt', function() {
                        const prompt = buildPrompt({
                                locale: 'en-US',
                                page: {
                                        title: '<strong>Homepage</strong>',
                                        url: 'https://example.com/test'
                                },
                                rules: [
                                        {
                                                ruleId: 'RGAA-4.1.2-1.1.1',
                                                ruleTitle: 'Image alternative text',
                                                ruleLevel: 'A',
                                                userContext: 'Focus on hero banner',
                                                targets: [
                                                        {
                                                                selector: 'img.hero',
                                                                outerHtml: '<img src="hero.jpg" alt="">'
                                                        }
                                                ]
                                        }
                                ]
                        });

                        expect(prompt).to.include('RGAA-4.1.2-1.1.1');
                        expect(prompt).to.include('img.hero');
                        expect(prompt).to.include('JSON object');
                        expect(prompt).to.include('C" | "NC" | "NA"');
                        expect(prompt).to.include('500 characters');
                        expect(prompt).to.not.include('<strong>');
                });

                it('should default to French instructions when locale is not English', function() {
                        const prompt = buildPrompt({
                                locale: 'fr-FR',
                                page: {},
                                rules: [
                                        {
                                                ruleId: 'RGAA-4.1.2-1.2.1',
                                                ruleTitle: 'Titre',
                                                targets: []
                                        }
                                ]
                        });

                        expect(prompt).to.include('Règle 1');
                        expect(prompt).to.include('Cibles transmises');
                        expect(prompt).to.include('JSON valide');
                });
        });
});

