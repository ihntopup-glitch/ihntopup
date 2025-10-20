'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { SavedUid } from "@/lib/data";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { userProfile } from "@/lib/data";

export default function SavedUidsCard() {
    const [uids, setUids] = useState<SavedUid[]>(userProfile.savedUids);
    const [newGame, setNewGame] = useState('');
    const [newUid, setNewUid] = useState('');

    const handleAddUid = () => {
        if (newGame && newUid) {
            setUids([...uids, { game: newGame, uid: newUid }]);
            setNewGame('');
            setNewUid('');
        }
    };

    const handleRemoveUid = (index: number) => {
        setUids(uids.filter((_, i) => i !== index));
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Saved Game UIDs</CardTitle>
                <CardDescription>Manage your frequently used game IDs for faster checkout.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {uids.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                            <div className="flex-grow">
                                <p className="font-semibold">{item.game}</p>
                                <p className="text-sm text-muted-foreground font-mono">{item.uid}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveUid(index)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                 <div className="mt-4 pt-4 border-t space-y-2">
                    <p className="font-medium">Add New UID</p>
                    <div className="flex gap-2">
                        <Input placeholder="Game Name (e.g. Free Fire)" value={newGame} onChange={(e) => setNewGame(e.target.value)} />
                        <Input placeholder="Game UID" value={newUid} onChange={(e) => setNewUid(e.target.value)} />
                        <Button onClick={handleAddUid} size="icon"><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
