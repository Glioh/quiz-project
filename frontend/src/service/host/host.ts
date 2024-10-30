import { GameState, NetService, PacketTypes, type ChangeGameStatePacket, type HostGamePacket, type Packet, type PlayerJoinPacket } from "../net";
import {writable, type Writable} from 'svelte/store';
import type  {Player} from "../../model/quiz";

export const state: Writable<GameState> = writable(GameState.Lobby);
export const players: Writable<Player[]> = writable([]);

export class HostGame {
    private net: NetService;

    constructor() {
        this.net = new NetService();
        this.net.connect();
        this.net.onPacket(p => this.onPacket(p));
    }

    hostQuiz(quizId: string) {
        let packet: HostGamePacket = {
            id: PacketTypes.HostGame,
            quizId: quizId,
        }

        this.net.sendPacket(packet);
    }

    start(){
        this.net.sendPacket({id: PacketTypes.StartGame});   
    }

    // Callback function for incoming packets
    onPacket(packet: Packet) {
        switch(packet.id) {
            case PacketTypes.ChangeGameState: {
                let data = packet as ChangeGameStatePacket;
                state.set(data.state);
                break;
            }
            case PacketTypes.PlayerJoin:{
                let data = packet as PlayerJoinPacket;
                players.update(p => [...p, data.player]);
                break;
            }
        }
    }
}
