const fs = require('fs');
const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to read accounts from a file
function readAccountsFromFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim().split(','));
  } catch (err) {
    console.error(`Error reading accounts file: ${err}`);
    return [];
  }
}

// Function to send messages using Termux's Facebook app
function sendMessage(accessToken, chatId, message) {
  const command = `am broadcast -a android.intent.action.SEND -n com.facebook.katana/com.facebook.katana.MessengerMainActivity --ei android.intent.extra.TEXT "${message}" --ei android.intent.extra.ACCESS_TOKEN "${accessToken}" --es android.intent.extra.PACKAGE com.facebook.katana --es android.intent.extra.STREAM "${chatId}"`;
  // Replace 'com.facebook.katana' with the Facebook app's package name if it's different
  console.log(`Sending message to ${chatId}: ${message}`);
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error sending message: ${error}`);
    } else {
      console.log(`Message sent successfully.`);
    }
  });
}

// Function to handle message sending for a single account
function sendMessagesForAccount(accountData, messages) {
  const [accessToken, chatId] = accountData;
  let messageIndex = 0;

  const interval = setInterval(() => {
    if (messageIndex < messages.length) {
      sendMessage(accessToken, chatId, messages[messageIndex]);
      messageIndex++;
    } else {
      clearInterval(interval);
      console.log(`All messages sent for account: ${accessToken}`);
    }
  }, delay * 1000);
}

// Main function to handle the message sending loop for multiple accounts
function sendMessages() {
  rl.question('Enter path to accounts file (one account per line - accessToken,chatId): ', (accountsFilePath) => {
    rl.question('Enter path to messages file: ', (messagesFilePath) => {
      rl.question('Enter delay between messages (in seconds): ', (delayInput) => {
        const delay = parseInt(delayInput);
        const accounts = readAccountsFromFile(accountsFilePath);
        const messages = readMessagesFromFile(messagesFilePath);

        if (accounts.length > 0 && messages.length > 0) {
          accounts.forEach(accountData => {
            sendMessagesForAccount(accountData, messages);
          });
        } else {
          console.error('Error: Either accounts or messages file is empty.');
          rl.close();
        }
      });
    });
  });
}

// Function to read messages from a file
function readMessagesFromFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8').split('\n').map(line => line.trim());
  } catch (err) {
    console.error(`Error reading message file: ${err}`);
    return [];
  }
}

console.log('Starting multi-account Facebook chat auto sending script...\n');

// Start the message sending loop
sendMessages();
