import tarot_data from './tarot_data.js';
import ollama from 'ollama';

import { phrases_for_thinking, fortune_cookie_phrases } from './closing_remarks.js';

export class TarotReading
{
    constructor() {

        this.states = {
            INTRODUCTION: 'step-introduction',
            MUSIC_SELECTION: "step-enhance-mood-music",
            ADVICE_SELECTION: "step-advice-selection",
            SHUFFLE_DECK: "step-shuffle-deck",
            CARD_SELECTION: "step-card-selection",
            CARD_READING: "step-card-reading",
            SUMMARY: "step-summary",
            CLOSING_WORDS: "step-closing-words"
        };

        this.five_card_spread_questions = [
            "What is the true nature of the situation at hand?",
            "What influences or aspirations are at work from above?",
            "What foundations underlie the current situation?",
            "What energies are waning or passing away?",
            "What new energies or possibilities are emerging?"
        ]
        this.five_card_spread_question_descriptions = [
            'The first card, the centerpiece of our Five-Card Cross. It represents the core essence of your inquiry.',
            'This card represents the overarching energies that influence your path from on high. It may reveal the goals you are striving towards or spiritual or mental influences affecting the situation.',
            'Like roots stretching deep into the earth, this card reveals past events or decisions that have led to this moment or subconscious influences.',
            'Like the setting sun, this card illuminates situations or influences that are coming to an end or aspects of your life or self that you are leaving behind.',
            'Like the first rays of dawn, this card illuminates, this cards shows new opportunities or potentials on the horizon. '
        ]

        this.current_question_index = -1;
        this.question_answers_memory = []; // store answers to questions for ending summary

        this.advice_type = null; // career or relationship advice
        this.currentState = this.states.INTRODUCTION; // initial screen select
        this.tarot_deck = tarot_data; // JSON data of tarot cards      
        this.selected_cards = []; // selected cards for reading. makes sure we don't pull them again
        this.audio_enabled = false;

        // Initialize UI with the initial state when HTML elements are loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.setup_click_events()
            this.transitionState(this.currentState);

            // slow down tarot card animation video man
            document.getElementById('tarot-reader-person').playbackRate  = 0.2;
            document.getElementById('tarot-reader-person').play();
        });  

       
    }

    setup_click_events() {
        const self = this; // Ensure 'this' inside the event listeners refers to the class instance


        document.getElementById('begin-tarot-reading-button').addEventListener('click', () => {
            this.transitionState(this.states.MUSIC_SELECTION);
        });

        document.getElementById('career').addEventListener('click', function() {
            self.advice_type_selected(this.id);
        });
    
        document.getElementById('relationships').addEventListener('click', function() {
            self.advice_type_selected(this.id);
        });

        document.getElementById('next-question-button').addEventListener('click', () => {
            this.transitionState(this.states.CARD_SELECTION);
        });

        document.getElementById('go-to-summary-button').addEventListener('click', () => {
            this.transitionState(this.states.SUMMARY);
        });

        document.getElementById('finish-button').addEventListener('click', () => {
            this.transitionState(this.states.CLOSING_WORDS)
        });


        document.getElementById('ignore-music-button').addEventListener('click', () => {
            this.audio_enabled = false;
            this.transitionState(this.states.ADVICE_SELECTION);
        })

        const play_pause_button = document.getElementById('enable-music-button');

        this.audio_enabled = true;
        play_pause_button.addEventListener('click', () => {
            const audio_player = document.getElementById('music-player');

            if(audio_player.paused) {
                audio_player.play();
                play_pause_button.innerText = 'Pause Music';
            }
            else {
                audio_player.pause();
                play_pause_button.innerText = 'Play Music';
            }

            this.transitionState(this.states.ADVICE_SELECTION);
        });

        // shuffling step click events
        document.getElementById('shuffle-deck-button').addEventListener('click', () => {
            this.tarot_deck = this.shuffle_deck(this.tarot_deck)            
            document.getElementById('card-shuffling-video').play(); // restart video of person shuffling
        });

        document.getElementById('done-shuffling-button').addEventListener('click', () => {
            this.transitionState(this.states.CARD_SELECTION);
        });

    }

    // State transition function
    transitionState(nextState) {

        // hide all sections
        Object.values(this.states).forEach(state => {
            document.getElementById(state).style.display = 'none';
        });

        document.getElementById(nextState).style.display = 'block'; // Show next state's section        
        this.currentState = nextState; // Update current state

        // Do operations and things after state change has been done
        if(this.currentState === this.states.CARD_SELECTION) 
        {
            this.build_cards_to_select();
            this.show_next_question();
        }

        // we have the card selection, now do the reading
        if(this.currentState === this.states.CARD_READING) {
            this.perform_card_reading()
        }

        if(this.currentState === this.states.SUMMARY)
        {
            this.show_summary()
        }

        if(this.currentState === this.states.CLOSING_WORDS)
        {
            this.show_closing_words()
        }

    }

    show_closing_words() {
        // pull some random phrases from a couple javascript files
        let closing_words_dom = document.getElementById('closing-words-text');
        let random_phrase = phrases_for_thinking[Math.floor(Math.random() * phrases_for_thinking.length)];
        let random_fortune_cookie = fortune_cookie_phrases[Math.floor(Math.random() * fortune_cookie_phrases.length)];

        closing_words_dom.innerText = random_phrase + ' ' + random_fortune_cookie;
    }

    show_next_question() {
        this.current_question_index += 1
        let question = this.five_card_spread_questions[this.current_question_index]
        let elements = document.getElementsByClassName('current-question-asked');

        // show description of what card will represent
        document.getElementById('current-question-description').innerText = this.five_card_spread_question_descriptions[this.current_question_index] +
        ' Which card whispers secrets meant for your ears alone?';

        
        for (let i = 0; i < elements.length; i++) {
            console.log( elements[i])
            elements[i].innerHTML = question; 
            elements[i].style.display = 'block';
        }
    }

    build_cards_to_select()
    {
        // render cards from JSON data
        let card_deck = document.querySelector('.card-deck');
    
        // clear all existing cards that might exist in .card-deck div
        card_deck.innerHTML = '';

        // allow cards to be upside down randomly (called reveral in tarot)
        // this changes the meaning of the card
        this.tarot_deck.forEach((card, index) => {
            let reversal_value = Math.round(Math.random()) ? true : false;
            card.reversal = reversal_value;
        });

    
        this.tarot_deck.forEach((card, index) => {
            
            // create the div element for each card
            let card_div = document.createElement('div');
            card_div.classList.add('card');
            card_div.id = `card-${index + 1}`;            
            card_deck.appendChild(card_div);
    
            card_div.addEventListener('click', () => {
                this.selected_cards.push(card.id); // Add any action you want to perform on click              
                this.tarot_deck = this.tarot_deck.filter(car => car.id !== card.id);    // remove item that was selected
                this.transitionState(this.states.CARD_READING);
            });
    
        });
    }
    
    get_card_by_id(cardId) {
        return tarot_data.find(card => card.id === cardId);
    }
    
    async perform_card_reading()
    {
        document.getElementById('reading-card-results').innerText = ''; // clear out previous reading

        // get last card ID
        let last_card_id = this.selected_cards[this.selected_cards.length - 1];
        let selected_card = this.get_card_by_id(last_card_id)
        let card_reverse_status_text = selected_card.reversal ? 'reversed' : 'upright'; // don't show anything if upright


        // update image of card selected on the DOM
        const selected_card_dom_image =  document.getElementById('currently-selected-card-image')
        selected_card_dom_image.src = `./images/${selected_card.arcanaType}/${selected_card.imageName}`;
        selected_card_dom_image.alt = selected_card.name

        

        // show card information on DOM with ID currently-selected-card
        document.getElementById('currently-selected-card-text').innerText = `${selected_card.name}`;
        if(card_reverse_status_text === 'reversed') {
            document.getElementById('currently-selected-card-text').innerText += ` (Reversed)`;
            selected_card_dom_image.alt += ' (Reversed)'
            selected_card_dom_image.classList.add('reversed')
        }
        else {
            selected_card_dom_image.classList.remove('reversed')
        }
    
    
        // hide the continue button if we are at the last question
        // and show the summary and closing words
        if(this.five_card_spread_questions.length === this.current_question_index + 1) {
            
            // hide the next question button
            document.getElementById('next-question-button').style.display = 'none';
    
            // show the go to summary button
            document.getElementById('go-to-summary-button').style.display = 'block';
        }

        // give instructions to the assistant (AI) first telling it is a fortune teller, and any contextual information it needs to know
        const message_data =  [
            {
                "role": 'assistant',
                'content': 'You are a fortune teller speaking in an intriguing and mysterious way, helping me read my fortune. We will use the five-card cross configuration. I will provide you a question I want answered and you will provide me response. Keep the response to 2 sentences. I already know the card, so you do not need to say it in the answer. The card will have a direction of upright or reversed, so please update your response based on the information provided.'
            },
            { "role": "user", 
                "content": `My question is ${this.five_card_spread_questions[this.current_question_index]} and I have picked the card ${this.get_card_by_id(last_card_id).name }. This direction of the card is ${card_reverse_status_text}. The reading results for the card need to be anchored to  my ${this.advice_type} and how it affects that.`
            }
        ];

        // get advice from AI
        const response = await ollama.chat({ model: 'llama3', messages: message_data, stream: true })
        const reading_card_dom_element = document.getElementById('reading-card-results');
        for await (const part of response) {
            reading_card_dom_element.innerText += part.message.content;

            if( this.audio_enabled)
            {
                this.play_click_sound()
            }
        }

        // this will get called when the for await loop is done...effectively the end of the API call
        this.question_answers_memory.push(reading_card_dom_element.innerHTML)
    }

    play_click_sound() {
        var clickSound = new Audio('text-click.mp3'); 
        clickSound.play();
    }
   


    async show_summary()
    {
        // hide the questions
        let elements = document.getElementsByClassName('current-question-asked');        
        for (let i = 0; i < elements.length; i++) {       
            elements[i].style.display = 'none';
        }

        // LLM API trying to summarize everything and summarize the reading.
        // concatenate everything in the question_answers_memory array
        let all_answers = this.question_answers_memory.join(' ');

      
        const summarize_messsage_data =  [
            {
                "role": 'user',
                'content': 'You are a fortune teller helping me read my fortune. You have given all the responses needed to my questions. These are the results:' +  all_answers + '. That is the end of the responses. Please provide a summary of the reading in 2 paragraphs at most.'
            }
        ];

        const response = await ollama.chat({ model: 'llama3', messages: summarize_messsage_data, stream: true })
        const summary_of_reading_dom_element = document.getElementById('summary-of-full-reading');
        for await (const part of response) {
            summary_of_reading_dom_element.innerText += part.message.content;
        }
    }
    
    advice_type_selected(type) 
    {
        // console.log('advice type selected in javascript')
        this.advice_type = type;
        this.transitionState(this.states.SHUFFLE_DECK);    
    }
    
    shuffle_deck(array) 
    {
        for (let i = array.length - 1; i > 0; i--) {
            // Generate a random index lower than the current position
            const j = Math.floor(Math.random() * (i + 1));
            
            // Swap elements at indices i and j
            [array[i], array[j]] = [array[j], array[i]];
        }
       
        return array;
    }
    

}

var app = new TarotReading(); // Create an instance of the class