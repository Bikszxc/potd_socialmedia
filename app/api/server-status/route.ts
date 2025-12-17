import { NextResponse } from 'next/server'
import { GameDig } from 'gamedig'

export async function GET() {
    try {
        const state = await GameDig.query({
            type: 'projectzomboid',
            host: '51.79.213.77',
            port: 16261,
            maxAttempts: 2,
            socketTimeout: 2000
        })

        return NextResponse.json({
            online: true,
            players: state.players.length,
            maxPlayers: state.maxplayers,
            ping: state.ping,
            name: state.name
        })
    } catch (error) {
        console.error("Gamedig query failed:", error)
        return NextResponse.json({
            online: false,
            players: 0,
            maxPlayers: 0,
            ping: 0,
            name: "Server Offline"
        }, { status: 500 })
    }
}
