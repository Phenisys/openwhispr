import {
	ChevronRight,
	FileText,
	FolderOpen,
	FolderPlus,
	Plus,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	createFolder,
	folderContainerKey,
	setActiveContext,
	setActiveNoteId,
	spaceContainerKey,
	toggleContainerExpanded,
	useActiveContext,
	useActiveFolderId,
	useActiveNoteId,
	useFolderCounts,
	useFolders,
	useNotesByContainer,
	useSpaces,
} from "../../stores/noteStore";
import type { FolderItem, NoteItem } from "../../types/electron";
import { cn } from "../lib/utils";

const FOLDER_INPUT_CLASS =
	"flex h-6 w-full items-center gap-1.5 rounded-md border border-border/40 bg-transparent px-1.5 text-xs text-foreground outline-none focus:border-primary/40";

interface LocalNotesTreeProps {
	onNewNote: (spaceId: number, folderId: number | null) => void;
	onShowStructureIntro?: () => void;
}

/**
 * Local-only notes tree (replaces the cloud SpacesTree after the account/cloud
 * purge, 2026-08-09): the default private space, its folders and root notes.
 * Team spaces, workspaces, sharing and upsells were removed upstream.
 */
export default function LocalNotesTree({
	onNewNote,
	onShowStructureIntro,
}: LocalNotesTreeProps) {
	const { t } = useTranslation();
	const spaces = useSpaces();
	const folders = useFolders();
	const folderCounts = useFolderCounts();
	const notesByContainer = useNotesByContainer();
	const activeContext = useActiveContext();
	const activeFolderId = useActiveFolderId();
	const activeNoteId = useActiveNoteId();

	const [creatingFolder, setCreatingFolder] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");

	const privateSpace = useMemo(
		() => spaces.find((s) => s.kind === "private") ?? null,
		[spaces],
	);
	const privateFolders = useMemo(
		() =>
			privateSpace ? folders.filter((f) => f.space_id === privateSpace.id) : [],
		[folders, privateSpace],
	);

	const isFolderActive = (folderId: number) =>
		activeContext?.folderId === folderId || activeFolderId === folderId;

	const handleFolderClick = (spaceId: number, folderId: number) => {
		setActiveContext(spaceId, folderId);
	};

	const confirmCreateFolder = async () => {
		const name = newFolderName.trim();
		setCreatingFolder(false);
		setNewFolderName("");
		if (!name || !privateSpace) return;
		const result = await createFolder(name, privateSpace.id);
		if (result.success && result.folder) {
			setActiveContext(privateSpace.id, result.folder.id);
		}
	};

	if (!privateSpace) {
		return null;
	}

	const spaceKey = spaceContainerKey(privateSpace.id);

	return (
		<div className="flex-1 overflow-y-auto px-2 pb-4">
			<div className="flex items-center gap-1 pr-1">
				<button
					onClick={() => toggleContainerExpanded(spaceKey)}
					className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-medium text-foreground/70 hover:bg-foreground/4 dark:hover:bg-white/4"
				>
					<ChevronRight
						size={12}
						className={cn(
							"shrink-0 text-foreground/30 transition-transform duration-150",
							"rotate-90",
						)}
					/>
					<span className="truncate">{t("notes.spaces.personal")}</span>
				</button>
				<button
					onClick={() => {
						setCreatingFolder(true);
						setNewFolderName("");
					}}
					className="shrink-0 rounded-md p-1 text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5"
					aria-label={t("notes.folders.create")}
				>
					<FolderPlus size={12} />
				</button>
				<button
					onClick={() => onNewNote(privateSpace.id, null)}
					className="shrink-0 rounded-md p-1 text-foreground/40 hover:text-foreground/70 hover:bg-foreground/5"
					aria-label={t("notes.list.newNote")}
				>
					<Plus size={12} />
				</button>
			</div>

			<div className="mt-0.5 space-y-px">
				{privateFolders.map((folder: FolderItem) => {
					const folderKey = folderContainerKey(folder.id);
					const active = isFolderActive(folder.id);
					const folderNotes = notesByContainer[folderKey];
					return (
						<div key={folder.id}>
							<button
								onClick={() => handleFolderClick(privateSpace.id, folder.id)}
								className={cn(
									"flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-xs transition-colors duration-150",
									active
										? "bg-primary/10 text-primary"
										: "text-foreground/60 hover:bg-foreground/4 dark:hover:bg-white/4",
								)}
							>
								<ChevronRight
									size={12}
									className={cn(
										"shrink-0 text-foreground/25 transition-transform duration-150",
										active && "rotate-90",
									)}
								/>
								<FolderOpen size={12} className="shrink-0 text-foreground/40" />
								<span className="truncate flex-1 text-left">{folder.name}</span>
								<span className="shrink-0 text-[10px] tabular-nums text-foreground/30">
									{folderCounts[folder.id] ?? 0}
								</span>
							</button>
							{active && (
								<div className="space-y-px">
									{(folderNotes ?? []).map((note: NoteItem) => (
										<button
											key={note.id}
											onClick={() => setActiveNoteId(note.id)}
											className={cn(
												"flex w-full items-center gap-1.5 rounded-md py-1 pl-6 pr-1.5 text-xs transition-colors duration-150",
												activeNoteId === note.id
													? "bg-primary/10 text-primary"
													: "text-foreground/50 hover:bg-foreground/4 dark:hover:bg-white/4",
											)}
										>
											<FileText
												size={11}
												className="shrink-0 text-foreground/30"
											/>
											<span className="truncate flex-1 text-left">
												{note.title}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					);
				})}

				{creatingFolder && (
					<div className="pr-2 pl-4">
						<input
							autoFocus
							value={newFolderName}
							onChange={(e) => setNewFolderName(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") void confirmCreateFolder();
								if (e.key === "Escape") {
									setCreatingFolder(false);
									setNewFolderName("");
								}
							}}
							onBlur={confirmCreateFolder}
							placeholder={t("notes.folders.folderName")}
							className={cn(
								FOLDER_INPUT_CLASS,
								"placeholder:text-foreground/20",
							)}
						/>
					</div>
				)}
			</div>

			{onShowStructureIntro && (
				<button
					onClick={onShowStructureIntro}
					className="mt-3 w-full rounded-md px-1.5 py-1 text-left text-[11px] text-foreground/35 hover:text-foreground/60 hover:bg-foreground/3 transition-colors"
				>
					{t("notes.tree.structureIntroHint", {
						defaultValue: "Afficher l'aide sur les notes",
					})}
				</button>
			)}
		</div>
	);
}
