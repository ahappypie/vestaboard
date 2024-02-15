import { VBMLComponentTemplate } from './component.ts';
import { VBClient } from './client.ts';
import { GetUpcomingEvents, EventRecord } from "./notion.ts";
import { format } from "https://deno.land/std@0.214.0/datetime/mod.ts";
import { TransformToken } from "./characters.ts";

const kv = await Deno.openKv('../data/kv');
const client = new VBClient();

let date: Date;
let categories: string[];
let events: EventRecord[];

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

await populateLocalData();
let categoryIndex= 0;
const firstDisplay = await FormatEvents();
await client.SendMessage(firstDisplay);
console.log('set first display');

Deno.cron('upcoming events', '* * * * *', async () => {
    await nextCategory()
    const display = await FormatEvents();
    await client.SendMessage(display);
    console.log('updated events');
});

async function FormatEvents() {
    // deno-lint-ignore no-explicit-any
    let props: any = {}
    props['category'] = categories[categoryIndex]
    let categoryData = await kv.get<CategoryEvents>(['categories', props['category']])
    if(!categoryData.value) {
        console.log('no categories found in kv, getting new data');
        await populateLocalData();
        categoryData = await kv.get<CategoryEvents>(['categories', props['category']])
    }
    categoryData.value?.events.forEach((e, i) => {
        const eventStart = datetime(e.start)
        props[`name${i}`] = e.event.substring(0, 16)
        props[`date${i}`] = format(eventStart, 'MM{59}dd')
    })

    const color: string = TransformToken(`:${categoryData.value?.color}:`)
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

type Event = Pick<EventRecord, 'event' | 'start' | 'end'>;
interface CategoryEvents {
    color: string;
    events: Event[];
}
async function populateLocalData(): Promise<void> {
    date = new Date();
    categories = [];
    events = await GetUpcomingEvents({after: date});

    const eventsByCategory: { [cat in string]: { color: string; events: Event[] } } = {};
    events.forEach(e => {
        if(!eventsByCategory[e.category]) {
            eventsByCategory[e.category] = {color: e.color, events: [{event: e.event, start: e.start, end: e.end}]}
        } else if (eventsByCategory[e.category].events.length < 4) {
            eventsByCategory[e.category].events.push({event: e.event, start: e.start, end: e.end})
        }

        if(categories.indexOf(e.category) < 0) {
            categories.push(e.category)
        }
    });

    for (const cat of Object.keys(eventsByCategory)) {
        await kv.set(['categories', cat], eventsByCategory[cat], { expireIn: (categories.length * 60 * 1000) - (500 * 60) }); //half a minute before looping to beginning of categories
    }
    // const iter = kv.list<string>({ prefix: ["categories"] });
    // const debugCategories = [];
    // for await (const res of iter) debugCategories.push(res);
    // console.log(debugCategories);
}

async function nextCategory(): Promise<void> {
    const zindex = categories.length - 1
    if(categoryIndex === zindex) {
        categoryIndex = 0;
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