import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts";

export interface EventRecord {
    event: string;
    category: string;
    color: string;
    start: string;
    end?: string;
}

interface UpcomingEventsArgs {
    after?: Date;
    limit?: number;
}

export async function GetUpcomingEvents(args: UpcomingEventsArgs): Promise<EventRecord[]> {
    const notion = new Client({
        auth: Deno.env.get("NOTION_TOKEN"),
    })


    const db = await notion.databases.query({
        database_id: Deno.env.get('NOTION_DB') || '',
        filter: {
            or: [
                {property: 'Date', date: {on_or_after: (args.after || new Date()).toISOString()}}
            ]
        },
        sorts: [{
            property: 'Date',
            direction: 'ascending'
        }]
    })

    console.log('got the db')

    const data: EventRecord[] = db.results.map((entry) => {
        return {
            event: entry.properties.Event.title[0].plain_text,
            category: entry.properties.Category.select.name,
            color: matchColor(entry.properties.Category.select.color),
            start: entry.properties.Date.date.start,
            end: entry.properties.Date.date.end
        }
    })

    console.log('reformatted data')
    return data.slice(0, args.limit)
}

const colors: { [key in string]: string } = {
    'default': 'filled',
    gray: 'white',
    brown: 'filled',
    purple: 'violet',
    pink: 'violet'
}

function matchColor(notion: string): string {
    if(colors[notion]) {
        return colors[notion]
    } else {
        return notion
    }
}