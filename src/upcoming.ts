import { VBMLComponentTemplate } from './component.ts';
import { VBClient } from './client.ts';
import { GetUpcomingEvents, EventRecord } from "./notion.ts";
import { format } from "https://deno.land/std@0.214.0/datetime/mod.ts";
import {TransformToken} from "./characters.ts";

const client = new VBClient();

let date = new Date();
let events = await GetUpcomingEvents({after: date});

let categories: string[] = [];
let eventsByCategory: { [cat in string]: Pick<EventRecord, 'event' | 'start' | 'end'>[] } = {};
let categoryColor: { [cat in string]: string } = {};

const ht = new VBMLComponentTemplate({
    template: 'Upcoming: {{category}}',
    style: {
        justify: 'left',
        height: 1
    }
});

const uet = new VBMLComponentTemplate({
    template: '{{date0}} {{name0}}\n{{date1}} {{name1}}\n{{date2}} {{name2}}\n{{date3}} {{name3}}',
    style: {
        justify: 'left',
        height: 4
    }
});


populateLocalData();
let categoryIndex= 0;
const firstDisplay = await FormatEvents();
await client.SendMessage(firstDisplay);
let refreshCounter = 1;
console.log('set first display');

Deno.cron('upcoming events', '* * * * *', async () => {
    await nextCategory()
    const display = await FormatEvents();
    await client.SendMessage(display);
    refreshCounter += 1;
    console.log('update events');
});

async function FormatEvents() {
    // deno-lint-ignore no-explicit-any
    let props: any = {}
    props['category'] = categories[categoryIndex]
    eventsByCategory[props.category].forEach((e, i) => {
        const eventStart = datetime(e.start)
        props[`name${i}`] = e.event.substring(0, 16)
        props[`date${i}`] = format(eventStart, 'MM{59}dd')
    })

    const color: string = TransformToken(`:${categoryColor[props.category]}:`)
    let colorLine = '';
    for (let j = 0; j < 22; j++) {
        colorLine += color
    }

    const clt = new VBMLComponentTemplate({
        template: colorLine,
        style: {
            justify: 'left',
            height: 1
        }
    })


    return await VBClient.Compose({
        props: props,
        components: [ht, clt, uet],
    });
}

function populateLocalData(): void {
    events.forEach(e => {
        if (eventsByCategory[e.category] && eventsByCategory[e.category].length < 4) {
            eventsByCategory[e.category].push({event: e.event, start: e.start, end: e.end})
        } else {
            eventsByCategory[e.category] = [{event: e.event, start: e.start, end: e.end}]
        }

        categoryColor[e.category] = e.color

        if(categories.indexOf(e.category) < 0) {
            categories.push(e.category)
        }
    })
}

async function nextCategory(): Promise<void> {
    const zindex = categories.length - 1
    if(categoryIndex === zindex) {
        date = new Date()
        events = await GetUpcomingEvents({after: date});
        categories = [];
        eventsByCategory = {};
        categoryColor = {};
        populateLocalData();
        categoryIndex = 0;
        refreshCounter = 1;
    } else {
        categoryIndex += 1
    }
}

function datetime(d: string): Date {
    const parts = d.split('T')
    if(parts.length > 1) {
        return new Date(d)
    } else {
        return new Date(d + 'T17:00:00.000-08:00')
    }
}