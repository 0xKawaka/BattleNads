//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract YourContract {
    // Maximum health for each monster set to 100000.
    uint256 public constant MAX_HEALTH = 100;

    // Health for team 1 and team 2 monsters.
    uint256 public team1Health;
    uint256 public team2Health;

    // Indicates if the battle is active.
    bool public battleActive;

    // Mapping to track which team a player has joined.
    mapping(address => uint8) public playerTeam;

    // Owner of the contract.
    address public owner;

    // Events for logging significant actions.
    event JoinedTeam(address indexed player, uint8 team);
    event Attack(address indexed attacker, uint8 attackerTeam, uint256 enemyRemainingHealth);
    event BattleEnded(uint8 winningTeam);
    event BattleRestarted();

    // Modifier to restrict functions to only the owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    /// @notice Constructor sets the contract deployer as the owner and initializes the battle.
    constructor(address _owner) {
        owner = _owner;
        _restartBattle();
    }

    /// @notice Allows a user to join a team (either 1 or 2).
    /// @param team The team number the user wants to join (must be 1 or 2).
    function joinTeam(uint8 team) external {
        require(team == 1 || team == 2, "Invalid team. Choose 1 or 2.");
        require(playerTeam[msg.sender] == 0, "You have already joined a team.");
        playerTeam[msg.sender] = team;
        emit JoinedTeam(msg.sender, team);
    }

    /// @notice Allows a player (who has joined a team) to attack the opposing monster.
    /// The attack deducts 1 health from the enemy monster.
    /// If the enemy monster’s health reaches 0, the battle ends.
    function attack() external {
        require(battleActive, "Battle has ended.");
        uint8 team = playerTeam[msg.sender];
        require(team == 1 || team == 2, "You must join a team before attacking.");

        if (team == 1) {
            // Attacker is on team 1 so attack team 2's monster.
            require(team2Health > 0, "Enemy monster already defeated.");
            team2Health -= 1;
            emit Attack(msg.sender, team, team2Health);
            if (team2Health == 0) {
                battleActive = false;
                emit BattleEnded(1); // Team 1 wins.
            }
        } else if (team == 2) {
            // Attacker is on team 2 so attack team 1's monster.
            require(team1Health > 0, "Enemy monster already defeated.");
            team1Health -= 1;
            emit Attack(msg.sender, team, team1Health);
            if (team1Health == 0) {
                battleActive = false;
                emit BattleEnded(2); // Team 2 wins.
            }
        }
    }

    /// @notice Restarts the battle by resetting both monsters' health.
    /// Can only be called by the owner and only when the battle has ended.
    function restartBattle() external onlyOwner {
        require(!battleActive, "Battle is still active.");
        _restartBattle();
        emit BattleRestarted();
    }

    /// @dev Internal function to reset the battle state.
    function _restartBattle() internal {
        team1Health = MAX_HEALTH;
        team2Health = MAX_HEALTH;
        battleActive = true;
    }
}
