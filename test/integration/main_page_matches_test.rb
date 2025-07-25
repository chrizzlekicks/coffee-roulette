# frozen_string_literal: true

require 'test_helper'

class MainPageMatchesTest < JavascriptIntegrationTest
  # TODO: Let's use cascade delete here to clean up the database
  # Let's also add database cleaner to the test suite
  setup do
    UserMatch.destroy_all
    Match.destroy_all
    User.destroy_all
  end

  test 'shows main page with a match' do
    login_user_and_create_matches(2)

    assert_text 'test1'
  end

  test 'shows user matches with two other users' do
    login_user_and_create_matches(3)

    assert_text 'test1'
    assert_text 'test2'
  end

  test 'shows no matches message when only one user exists' do
    stub_multiple_users(1)
    UserMatchingJob.perform_now

    visit '/signin'
    find_field(id: 'login').click
    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')
    click_on 'Submit'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
    assert_text 'No matches yet'
    assert_text 'Check back later for new coffee connections!'
  end

  test 'excludes inactive users from matches' do
    stub_multiple_users(4)
    User.find_by(username: 'test2').update!(active: false)
    User.find_by(username: 'test3').update!(active: false)

    UserMatchingJob.perform_now

    visit '/signin'
    find_field(id: 'login').click
    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')
    click_on 'Submit'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
    assert_text 'test1'
    assert_no_text 'test2'
    assert_no_text 'test3'
  end

  test 'shows no matches when user has no active status' do
    stub_multiple_users(3)
    user = User.find_by(username: 'test0')
    user.update!(active: false)

    UserMatchingJob.perform_now

    visit '/signin'
    find_field(id: 'login').click
    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')
    click_on 'Submit'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
    assert_text 'No matches yet'
    assert_no_text 'test1'
    assert_no_text 'test2'
  end

  test 'shows matches for odd number of users' do
    login_user_and_create_matches(5)

    page_text = page.text
    other_users = %w[test1 test2 test3 test4]
    matched_users = other_users.select { |user| page_text.include?(user) }

    assert_operator matched_users.count, :>=, 1, 'Should show at least one other user'
  end

  test 'shows matches for large group with mixed distribution' do
    login_user_and_create_matches(7)

    page_text = page.text
    other_users = %w[test1 test2 test3 test4 test5 test6]
    matched_users = other_users.select { |user| page_text.include?(user) }

    assert_operator matched_users.count, :>=, 1, 'Should show at least one other user'
    assert_text 'Your Coffee Matches'
  end

  test 'shows home page when accessing main page without authentication' do
    visit '/main'

    assert_text 'Welcome'
    assert_text 'CoffeeRoulette'
  end

  test 'navigates to main after successful authentication with valid credentials' do
    stub_multiple_users(2)
    UserMatchingJob.perform_now

    visit '/signin'
    find_field(id: 'login').click
    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')
    click_on 'Submit'

    assert_current_path '/main'
    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'
  end

  private

  def login_user_and_create_matches(user_amount)
    stub_multiple_users(user_amount)

    UserMatchingJob.perform_now

    visit '/signin'

    find_field(id: 'login').click

    fill_in('username', with: 'test0')
    fill_in('password', with: 'passwd0')

    click_on 'Submit'

    assert_selector "a[href$='/main']", text: 'CoffeeRoulette'

    assert_no_text 'Welcome'
    assert_selector '.timeline'
  end
end
