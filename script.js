import tarot_data from './tarot_data.js';
import ollama from 'ollama';

import { phrases_for_thinking, fortune_cookie_phrases } from './closing_remarks.js';

export class TarotReading
{
    constructor() {

        this.states = {
            ADVICE_SELECTION: "step-advice-selection",
            CARD_SELECTION: "step-card-selection",
            CARD_READING: "step-card-reading",
            SUMMARY: "step-summary",
            CLOSING_WORDS: "step-closing-words"
        };

        this.five_card_spread_questions = [
            "What is happening at the moment?",
            "How can I weather it easily and with grace?",
            "What is the lesson?",
            "What is leaving at this time?",
            "What is arriving at this time?"
        ]
        this.current_question_index = -1;

        this.question_answers_memory = []; // store answers to questions for ending summary

        this.advice_type = null; // career or relationship advice
        this.currentState = this.states.ADVICE_SELECTION; // initial screen select
        this.tarot_deck = tarot_data; // JSON data of tarot cards
        this.selected_cards = []; // selected cards for reading. makes sure we don't pull them again

        // Initialize UI with the initial state when HTML elements are loaded
        document.addEventListener('DOMContentLoaded', () => {
            this.setup_click_events()
            this.transitionState(this.currentState);
        });  
       
    }

    setup_click_events() {
        const self = this; // Ensure 'this' inside the event listeners refers to the class instance

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
        document.getElementById('current-question-asked').innerText = question

    }

    build_cards_to_select()
    {
        // eventually need to remove IDs for cards that were already selected
    
        // render cards from JSON data
        let card_deck = document.querySelector('.card-deck');
    
        // clear all existing cards that might exist in .card-deck div
        card_deck.innerHTML = '';
    
    
        this.tarot_deck = this.shuffle_deck(this.tarot_deck) // shuffle deck of cards

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
            
            // card_div.innerHTML = `Card ${card.id}: ${card.name}`;            
            // if(card.reversal) {
            //     card_div.innerHTML += ` (Reversed)`;
            // }

            card_deck.appendChild(card_div);
    
            card_div.addEventListener('click', () => {
                //console.log(`Clicked on card ${index + 1}: ${card.name} ${card.id}`);
                
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
        let card_reverse_status_text = this.get_card_by_id(last_card_id).reversal ? 'reversed' : 'upright'; // don't show anything if upright


        // update image of card selected on the DOM
        const image_path = './images/card-back.jpg'; // to later replace with data from card
        const selected_card_dom_image =  document.getElementById('currently-selected-card-image')
        selected_card_dom_image.src = image_path;
        selected_card_dom_image.alt = this.get_card_by_id(last_card_id).name


        // show card information on DOM with ID currently-selected-card
        document.getElementById('currently-selected-card').innerText = `${this.get_card_by_id(last_card_id).name}`;
        if(card_reverse_status_text === 'reversed') {
            document.getElementById('currently-selected-card').innerText += ` (Reversed)`;
            selected_card_dom_image.alt += ' (Reversed)'
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
                'content': 'You are a fortune teller helping me read my fortune. I will provide you a question I want answered and you will provide me response. Keep the response to 1 paragraph. The card will have a direction of upright or reversed, so please update your response based on the information provided.'
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
        }

        // this will get called when the for await loop is done...effectively the end of the API call
        this.question_answers_memory.push(reading_card_dom_element.innerHTML)
    }
   


    async show_summary()
    {
        document.getElementById('current-question-asked').style.display = 'none';

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
        this.transitionState(this.states.CARD_SELECTION);    
    }
    
    shuffle_deck(array) {
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