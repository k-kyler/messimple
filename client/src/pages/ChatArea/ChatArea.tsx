import { FC, useState, useEffect, FormEvent, MouseEvent } from "react";
import "./ChatArea.css";
import io from "socket.io-client";
import {
    Paper,
    Avatar,
    Typography,
    IconButton,
    Badge,
    FormControl,
    TextField,
    Dialog,
    Grid,
    Tooltip,
    Drawer,
    Container,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    Menu,
    MenuItem,
} from "@material-ui/core";
import { Theme, withStyles, createStyles } from "@material-ui/core/styles";
import GroupIcon from "@material-ui/icons/Group";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import SendIcon from "@material-ui/icons/Send";
import InsertEmoticonIcon from "@material-ui/icons/InsertEmoticon";
import ImageIcon from "@material-ui/icons/Image";
import BackupIcon from "@material-ui/icons/Backup";
import DeleteIcon from "@material-ui/icons/Delete";
import DuoIcon from "@material-ui/icons/Duo";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import Picker, { IEmojiData } from "emoji-picker-react";
import ListIcon from "@material-ui/icons/List";
import Message from "../../components/Message/Message";
import UsersList from "../../components/UsersList/UsersList";

interface IChatArea {
    match: {
        params: {
            username: string;
            room: string;
        };
    };
}

export type userDataType = {
    id: string;
    username: string;
    room: string;
};

type messageType = {
    id: string;
    username: string;
    text: string;
    imageSrc?: string;
    videoSrc?: string;
};

export const StyledBadge = withStyles((theme: Theme) =>
    createStyles({
        badge: {
            backgroundColor: "#44b700",
            color: "#44b700",
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
            "&::after": {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                border: "1px solid currentColor",
            },
        },
    })
)(Badge);

let socket: any;

const ChatArea: FC<IChatArea> = ({ match }) => {
    const [room, setRoom] = useState("");
    const [messages, setMessages] = useState<messageType[]>([]);
    const [input, setInput] = useState("");
    const [userId, setUserId] = useState("");
    const [chosenEmoji, setChosenEmoji] = useState<IEmojiData | any>();
    const [dialogState, setDialogState] = useState(false);
    const [openUsersList, setOpenUsersList] = useState(false);
    const [usersData, setUsersData] = useState<userDataType[]>([]);
    const [errorAlert, setErrorAlert] = useState(false);
    const [uploadImageDialog, setUploadImageDialog] = useState(false);
    const [uploadVideoDialog, setUploadVideoDialog] = useState(false);
    const [previewImageSrc, setPreviewImageSrc] = useState("");
    const [previewVideoSrc, setPreviewVideoSrc] = useState("");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [checkJoin, setCheckJoin] = useState(false);

    const SERVER_URL: string = "http://localhost:5000";

    const scrollToBottom = () => {
        let chatAreaMessages: HTMLElement | any =
            document.getElementById("chatAreaMessages");

        chatAreaMessages.scrollTop = chatAreaMessages.scrollHeight;
    };

    const setInputHandler = (value: string) => {
        setInput(value);
    };

    const sendMessageHandler = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (input) {
            socket.emit("Send message", input, () => setInput(""));
        }
    };

    const onEmojiClick = (
        event: MouseEvent<Element, globalThis.MouseEvent>,
        emojiObject: IEmojiData
    ) => {
        setChosenEmoji(emojiObject);
    };

    const dialogHandler = () => {
        setDialogState(true);
        closeMenuHandler();
    };

    const openUsersListHandler = () => {
        setOpenUsersList(true);
    };

    const uploadImageDialogHandler = () => {
        setUploadImageDialog(true);
        closeMenuHandler();
    };

    const uploadVideoDialogHandler = () => {
        setUploadVideoDialog(true);
        closeMenuHandler();
    };

    const displayPreviewImageHandler = (event: any) => {
        setPreviewImageSrc(URL.createObjectURL(event.target.files[0]));
    };

    const displayPreviewVideoHandler = (event: any) => {
        setPreviewVideoSrc(URL.createObjectURL(event.target.files[0]));
    };

    const uploadImageHandler = () => {
        if (previewImageSrc) {
            socket.emit("Upload image", previewImageSrc, () => {
                setUploadImageDialog(false);
                setPreviewImageSrc("");
            });
        }
    };

    const uploadVideoHandler = () => {
        if (previewVideoSrc) {
            socket.emit("Upload video", previewVideoSrc, () => {
                setUploadVideoDialog(false);
                setPreviewVideoSrc("");
            });
        }
    };

    const openMenuHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenuHandler = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const { username, room } = match.params;

        setRoom(room);

        socket = io(SERVER_URL);
        socket.emit(
            "Join room",
            {
                username,
                room,
            },
            (error: string) => {
                if (error) {
                    setErrorAlert(true);
                }
            }
        );
        socket.on("User id", (userId: string) => {
            setUserId(userId);
            setCheckJoin(true);
        });

        return () => {
            socket.emit("disconnect");
            socket.off();
        };
    }, [SERVER_URL, match.params]);

    useEffect(() => {
        socket.on(
            "Render message",
            (message: messageType, usersDataEmit: userDataType[]) => {
                setMessages([...messages, message]);
                setUsersData(usersDataEmit);
            }
        );

        socket.on(
            "Render image",
            (imageMessage: messageType, usersDataEmit: userDataType[]) => {
                setMessages([...messages, imageMessage]);
                setUsersData(usersDataEmit);
            }
        );

        socket.on(
            "Render video",
            (videoMessage: messageType, usersDataEmit: userDataType[]) => {
                setMessages([...messages, videoMessage]);
                setUsersData(usersDataEmit);
            }
        );

        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (chosenEmoji) setInput((input) => input + chosenEmoji.emoji);
    }, [chosenEmoji]);

    return (
        <Container className="chatArea">
            {/* Chat box section */}
            <Grid
                container
                justify="center"
                alignItems="center"
                className="chatArea__center"
            >
                <Grid item md={9}>
                    <Paper className="chatArea__paper">
                        <div className="chatArea__header">
                            <div className="chatArea__room">
                                <StyledBadge
                                    overlap="circle"
                                    anchorOrigin={{
                                        vertical: "bottom",
                                        horizontal: "right",
                                    }}
                                    variant="dot"
                                >
                                    <Avatar className="chatArea__roomIcon">
                                        <GroupIcon />
                                    </Avatar>
                                </StyledBadge>

                                <Tooltip title={room} placement="top-start">
                                    <Typography
                                        className="chatArea__roomName"
                                        variant="body1"
                                    >
                                        {room}
                                    </Typography>
                                </Tooltip>
                            </div>

                            <Tooltip title="Room members" placement="top">
                                <IconButton
                                    disabled={!checkJoin}
                                    onClick={openUsersListHandler}
                                    className="chatArea__usersList"
                                >
                                    <ListIcon />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Exit room" placement="top">
                                <a href="/" className="chatArea__outRoom">
                                    <IconButton>
                                        <ExitToAppIcon />
                                    </IconButton>
                                </a>
                            </Tooltip>
                        </div>

                        <div className="chatArea__body">
                            <div
                                className="chatArea__messages"
                                id="chatAreaMessages"
                            >
                                {messages.map((message, index) => (
                                    <Message
                                        key={index}
                                        id={message.id}
                                        username={message.username}
                                        text={message.text}
                                        imageSrc={message.imageSrc}
                                        videoSrc={message.videoSrc}
                                        userId={userId}
                                    />
                                ))}
                            </div>

                            <form
                                onSubmit={sendMessageHandler}
                                className="chatArea__form"
                            >
                                <FormControl className="chatArea__formControl">
                                    <IconButton
                                        color="primary"
                                        onClick={openMenuHandler}
                                    >
                                        <OpenInNewIcon />
                                    </IconButton>

                                    <TextField
                                        className="chatArea__input"
                                        label="Send a message..."
                                        variant="outlined"
                                        onChange={(event) =>
                                            setInputHandler(event.target.value)
                                        }
                                        value={input}
                                        size="small"
                                    />

                                    <IconButton
                                        disabled={!input}
                                        color="primary"
                                        type="submit"
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </FormControl>
                            </form>
                        </div>
                    </Paper>
                </Grid>
            </Grid>
            {/* End of chat box section */}

            {/* Emoji dialog section */}
            <Dialog open={dialogState} onClose={() => setDialogState(false)}>
                <Picker
                    onEmojiClick={onEmojiClick}
                    disableAutoFocus={true}
                    native
                />
            </Dialog>
            {/* End of emoji dialog section */}

            {/* Upload image dialog */}
            <Dialog
                className="chatArea__uploadImageDialog"
                open={uploadImageDialog}
                onClose={() => setUploadImageDialog(false)}
            >
                <DialogTitle>Upload image</DialogTitle>
                <DialogContent>
                    <img
                        src={previewImageSrc}
                        className="chatArea__previewImage"
                    />

                    {!previewImageSrc && (
                        <>
                            <input
                                accept="image/*"
                                id="contained-button-image"
                                multiple
                                type="file"
                                onChange={(event) =>
                                    displayPreviewImageHandler(event)
                                }
                            />
                            <label htmlFor="contained-button-image">
                                <Button
                                    startIcon={<BackupIcon />}
                                    color="primary"
                                    component="span"
                                >
                                    Choose your image
                                </Button>
                            </label>
                        </>
                    )}

                    {previewImageSrc && (
                        <div className="chatArea__uploadImageDialogRemove">
                            <Button
                                startIcon={<DeleteIcon />}
                                color="secondary"
                                component="span"
                                onClick={() => setPreviewImageSrc("")}
                            >
                                Remove image
                            </Button>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={!previewImageSrc}
                        onClick={uploadImageHandler}
                    >
                        Upload
                    </Button>

                    <Button
                        onClick={() => setUploadImageDialog(false)}
                        color="secondary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* End of upload image dialog */}

            {/* Upload video dialog */}
            <Dialog
                className="chatArea__uploadVideoDialog"
                open={uploadVideoDialog}
                onClose={() => setUploadVideoDialog(false)}
            >
                <DialogTitle>Upload video</DialogTitle>
                <DialogContent>
                    {!previewVideoSrc && (
                        <>
                            <input
                                accept="video/*"
                                id="contained-button-video"
                                multiple
                                type="file"
                                onChange={(event) =>
                                    displayPreviewVideoHandler(event)
                                }
                            />
                            <label htmlFor="contained-button-video">
                                <Button
                                    startIcon={<BackupIcon />}
                                    color="primary"
                                    component="span"
                                >
                                    Choose your video
                                </Button>
                            </label>
                        </>
                    )}

                    {previewVideoSrc && (
                        <>
                            <video
                                controls
                                src={previewVideoSrc}
                                className="chatArea__previewVideo"
                            ></video>

                            <div className="chatArea__uploadVideoDialogRemove">
                                <Button
                                    startIcon={<DeleteIcon />}
                                    color="secondary"
                                    component="span"
                                    onClick={() => setPreviewVideoSrc("")}
                                >
                                    Remove video
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        color="primary"
                        disabled={!previewVideoSrc}
                        onClick={uploadVideoHandler}
                    >
                        Upload
                    </Button>

                    <Button
                        onClick={() => setUploadVideoDialog(false)}
                        color="secondary"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
            {/* End of upload video dialog */}

            {/* Chat menu */}
            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={closeMenuHandler}
                className="chatArea__chatMenu"
            >
                <MenuItem
                    color="primary"
                    startIcon={<InsertEmoticonIcon />}
                    component={Button}
                    onClick={dialogHandler}
                >
                    Emoji
                </MenuItem>
                <MenuItem
                    color="primary"
                    startIcon={<ImageIcon />}
                    component={Button}
                    onClick={uploadImageDialogHandler}
                >
                    Upload image
                </MenuItem>
                <MenuItem
                    color="primary"
                    startIcon={<DuoIcon />}
                    component={Button}
                    onClick={uploadVideoDialogHandler}
                >
                    Upload video
                </MenuItem>
            </Menu>
            {/* End of chat menu */}

            {/* Error alert dialog section */}
            <Dialog open={errorAlert} onClose={() => setErrorAlert(false)}>
                <DialogTitle>Invalid username</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Your username has already been taken in this room,
                        please try another.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        autoFocus
                        onClick={() => (window.location.href = "/")}
                    >
                        Go back
                    </Button>
                </DialogActions>
            </Dialog>
            {/* End of error alert dialog section */}

            {/* Users list drawer section */}
            <Drawer
                anchor="right"
                open={openUsersList}
                onClose={() => setOpenUsersList(false)}
            >
                <UsersList
                    usersData={usersData}
                    userId={userId}
                    setOpenUsersList={setOpenUsersList}
                />
            </Drawer>
            {/* End of users list drawer section */}
        </Container>
    );
};

export default ChatArea;
